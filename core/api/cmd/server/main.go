package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"odokoid-api/internal/config"
	"odokoid-api/internal/db"
)

func main() {
	slog.Info("Starting Odokoid API")

	cfg, err := config.Load()
	if err != nil {
		slog.Error("Failed to load config", "error", err.Error())
		os.Exit(1)
	}

	slog.Info("Config loaded", "env", cfg.Env, "port", cfg.Port)

	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		slog.Error("Failed to connect to database", "error", err.Error())
		os.Exit(1)
	}
	defer database.Close()

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	slog.Info("Server starting", "port", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		slog.Error("Failed to start server", "error", err.Error())
		os.Exit(1)
	}
}
