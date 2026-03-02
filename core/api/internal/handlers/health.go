package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HealthResponse struct {
	Status   string `json:"status"`
	Database string `json:"database"`
}

func Health(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		if err := pool.Ping(ctx); err != nil {
			c.JSON(http.StatusServiceUnavailable, HealthResponse{
				Status:   "degraded",
				Database: "down",
			})
			return
		}

		c.JSON(http.StatusOK, HealthResponse{
			Status:   "ok",
			Database: "up",
		})
	}
}
