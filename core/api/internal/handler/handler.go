package handler

import (
	"database/sql"

	sqlcgen "odokoid-api/sqlc"
)

type Handler struct {
	queries *sqlcgen.Queries
}

func New(db *sql.DB) *Handler {
	return &Handler{
		queries: sqlcgen.New(db),
	}
}
