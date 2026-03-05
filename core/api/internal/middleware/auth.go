package middleware

import (
	"log/slog"
	"net/http"
	"net/url"
	"time"

	"github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/gin-gonic/gin"
)

func NewValidator(domain, audience string) (*validator.Validator, error) {
	issuerURL, err := url.Parse("https://" + domain + "/")
	if err != nil {
		return nil, err
	}

	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)

	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{audience},
		validator.WithAllowedClockSkew(time.Minute),
	)
	if err != nil {
		return nil, err
	}

	return jwtValidator, nil
}

func Auth(domain, audience string) gin.HandlerFunc {
	jwtValidator, err := NewValidator(domain, audience)
	if err != nil {
		slog.Error("Failed to create JWT validator", "error", err.Error())
	}

	errorHandler := func(w http.ResponseWriter, r *http.Request, err error) {
		slog.Error("JWT validation error", "error", err.Error())
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(`{"error":"unauthorized"}`))
	}

	middleware := jwtmiddleware.New(
		jwtValidator.ValidateToken,
		jwtmiddleware.WithErrorHandler(errorHandler),
	)

	return func(c *gin.Context) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims := r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
			c.Set("userID", claims.RegisteredClaims.Subject)
			c.Next()
		})

		middleware.CheckJWT(handler).ServeHTTP(c.Writer, c.Request)
	}
}
