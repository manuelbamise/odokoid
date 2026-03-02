package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/pressly/goose/v3"

	"odokoid-core/internal/config"
	"odokoid-core/internal/db"
	"odokoid-core/internal/server"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found, using environment variables")
	}

	cfg := config.Load()

	log.Printf("Connecting to database...")
	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()
	log.Printf("Database connected successfully")

	log.Printf("Running migrations...")
	if err := runMigrations(cfg.DatabaseURL); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}
	log.Printf("Migrations completed")

	log.Printf("Starting server on port %s...", cfg.Port)
	router := server.New(database.Pool)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func runMigrations(databaseURL string) error {
	dir, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("failed to get working directory: %w", err)
	}

	goose.SetTableName("schema_migrations")

	migrationDir := dir + "/migrations"
	if _, err := os.Stat(migrationDir); os.IsNotExist(err) {
		log.Printf("No migrations directory found, skipping...")
		return nil
	}

	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return fmt.Errorf("failed to open database for migrations: %w", err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := goose.UpContext(ctx, db, "migrations"); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	return nil
}
