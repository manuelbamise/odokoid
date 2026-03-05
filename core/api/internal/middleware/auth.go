package middleware

import (
	"context"
	"net/http"
	"net/url"
	"time"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/gin-gonic/gin"
)

type CustomClaims struct {
	Sub string `json:"sub"`
}

func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}

func Auth(domain, audience string) gin.HandlerFunc {
	issuerURL, _ := url.Parse("https://" + domain + "/")

	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)

	jwtValidator, _ := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{audience},
		validator.WithCustomClaims(func() validator.CustomClaims {
			return &CustomClaims{}
		}),
	)

	middleware := jwtmiddleware.New(jwtValidator.ValidateToken)

	return func(c *gin.Context) {
		encounteredError := true
		var token *validator.ValidatedClaims

		middleware.CheckJWT(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			encounteredError = false
			token = r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
			c.Request = r
		})).ServeHTTP(c.Writer, c.Request)

		if encounteredError {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		claims := token.CustomClaims.(*CustomClaims)
		c.Set("userID", claims.Sub)
		c.Next()
	}
}
