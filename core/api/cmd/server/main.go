package main

import (
	"log/slog"
	"net/http"
	"os"

	"odokoid-api/internal/config"
	"odokoid-api/internal/db"
	"odokoid-api/internal/handler"
	"odokoid-api/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pressly/goose/v3"
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

	if err := goose.SetDialect("postgres"); err != nil {
		slog.Error("Failed to set goose dialect", "error", err.Error())
		os.Exit(1)
	}

	if err := goose.Up(database, "./migrations"); err != nil {
		slog.Error("Failed to run migrations", "error", err.Error())
		os.Exit(1)
	}

	slog.Info("Migrations completed successfully")

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

	h := handler.New(database)

	// router.GET("/health", func(c *gin.Context) {
	// 	c.JSON(http.StatusOK, gin.H{"status": "ok"})
	// })

	api := router.Group("/api")

	api.POST("/forms/:id/submissions", h.CreateSubmission)
	api.GET("/forms/:id", h.GetFormPublic)
	api.POST("/users/sync", h.SyncUser)

	api.Use(middleware.Auth(cfg.Auth0Domain, cfg.Auth0Audience))
	{
		api.POST("/forms", h.CreateForm)
		api.GET("/forms", h.ListForms)
		api.PUT("/forms/:id", h.UpdateForm)
		api.DELETE("/forms/:id", h.DeleteForm)
		api.GET("/forms/:id/submissions", h.ListSubmissions)
		api.GET("/forms/:id/submissions/count", h.CountSubmissions)
	}

	slog.Info("Server starting", "port", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		slog.Error("Failed to start server", "error", err.Error())
		os.Exit(1)
	}
}
