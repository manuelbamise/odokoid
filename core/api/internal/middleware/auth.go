package middleware

import (
	"context"
	"log/slog"
	"net/http"
	"net/url"
	"time"

	"github.com/auth0/go-jwt-middleware/v3"
	"github.com/auth0/go-jwt-middleware/v3/jwks"
	"github.com/auth0/go-jwt-middleware/v3/validator"
	"github.com/gin-gonic/gin"
)

type CustomClaims struct {
	Sub string `json:"sub"`
}

func (c *CustomClaims) Validate(ctx context.Context) error {
	return nil
}

func NewValidator(domain, audience string) (*validator.Validator, error) {
	issuerURL, err := url.Parse("https://" + domain + "/")
	if err != nil {
		return nil, err
	}

	provider, err := jwks.NewCachingProvider(
		jwks.WithIssuerURL(issuerURL),
		jwks.WithCacheTTL(5*time.Minute),
	)
	if err != nil {
		return nil, err
	}

	jwtValidator, err := validator.New(
		validator.WithKeyFunc(provider.KeyFunc),
		validator.WithAlgorithm(validator.RS256),
		validator.WithIssuer(issuerURL.String()),
		validator.WithAudiences([]string{audience}),
		validator.WithCustomClaims(func() *CustomClaims {
			return &CustomClaims{}
		}),
		validator.WithAllowedClockSkew(30*time.Second),
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
	}

	middleware, err := jwtmiddleware.New(
		jwtmiddleware.WithValidator(jwtValidator),
		jwtmiddleware.WithErrorHandler(errorHandler),
	)
	if err != nil {
		slog.Error("Failed to create middleware", "error", err.Error())
	}

	return func(c *gin.Context) {
		encounteredError := true

		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			encounteredError = false
			c.Request = r
			c.Next()
		})

		middleware.CheckJWT(handler).ServeHTTP(c.Writer, c.Request)

		if encounteredError {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		// Extract user ID from custom claims using validator context key
		claimsVal := c.Request.Context().Value("jwtmiddleware ValidatedClaims")
		if claimsVal == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no claims found"})
			return
		}

		claims, ok := claimsVal.(*validator.ValidatedClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}

		userClaims, ok := claims.CustomClaims.(*CustomClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid custom claims"})
			return
		}

		c.Set("userID", userClaims.Sub)
		c.Next()
	}
}
