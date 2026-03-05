package config

import (
	"errors"
	"log/slog"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL   string
	Port          string
	Env           string
	Auth0Domain   string
	Auth0Audience string
}

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		slog.Warn("No .env file found, using environment variables")
	}

	cfg := &Config{
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		Port:          getEnv("PORT", "8080"),
		Env:           getEnv("ENV", "development"),
		Auth0Domain:   os.Getenv("AUTH0_DOMAIN"),
		Auth0Audience: os.Getenv("AUTH0_AUDIENCE"),
	}

	if cfg.DatabaseURL == "" {
		return nil, errors.New("DATABASE_URL is required")
	}

	if cfg.Auth0Domain == "" || cfg.Auth0Audience == "" {
		return nil, errors.New("AUTH0_DOMAIN and AUTH0_AUDIENCE are required")
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
