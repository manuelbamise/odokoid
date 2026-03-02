package server

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"odokoid-core/internal/handlers"
)

func New(pool *pgxpool.Pool) *gin.Engine {
	r := gin.Default()

	r.GET("/health", handlers.Health(pool))

	return r
}
