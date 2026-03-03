package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"odokoid-api/internal/model"

	sqlcgen "odokoid-api/sqlc"
)

type CreateFormInput struct {
	Title       string        `json:"title" binding:"required"`
	Description *string       `json:"description"`
	Fields      []model.Field `json:"fields"`
}

type UpdateFormInput struct {
	Title       *string       `json:"title"`
	Description *string       `json:"description"`
	Fields      []model.Field `json:"fields"`
}

type FormResponse struct {
	ID          string        `json:"id"`
	Title       string        `json:"title"`
	Description string        `json:"description,omitempty"`
	Fields      []model.Field `json:"fields"`
	CreatedAt   string        `json:"createdAt"`
	UpdatedAt   string        `json:"updatedAt"`
}

func (h *Handler) CreateForm(c *gin.Context) {
	var input CreateFormInput
	if err := c.ShouldBindJSON(&input); err != nil {
		respondError(c, http.StatusBadRequest, "title is required")
		return
	}

	if strings.TrimSpace(input.Title) == "" {
		respondError(c, http.StatusBadRequest, "title is required")
		return
	}

	if len(input.Title) > 255 {
		respondError(c, http.StatusBadRequest, "title must be at most 255 characters")
		return
	}

	fieldsJSON, err := json.Marshal(input.Fields)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to serialize fields")
		return
	}

	var description sql.NullString
	if input.Description != nil && *input.Description != "" {
		description = sql.NullString{String: *input.Description, Valid: true}
	}

	form, err := h.queries.CreateForm(c.Request.Context(), sqlcgen.CreateFormParams{
		Title:       input.Title,
		Description: description,
		Fields:      fieldsJSON,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to create form")
		return
	}

	respondOK(c, http.StatusCreated, formToResponse(form))
}

func (h *Handler) ListForms(c *gin.Context) {
	forms, err := h.queries.ListForms(c.Request.Context())
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to list forms")
		return
	}

	var response []FormResponse
	for _, f := range forms {
		response = append(response, formToResponse(f))
	}

	respondOK(c, http.StatusOK, response)
}

func (h *Handler) GetForm(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(c, http.StatusBadRequest, "invalid form id")
		return
	}

	form, err := h.queries.GetForm(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(c, http.StatusNotFound, "form not found")
			return
		}
		respondError(c, http.StatusInternalServerError, "failed to get form")
		return
	}

	respondOK(c, http.StatusOK, formToResponse(form))
}

func (h *Handler) UpdateForm(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(c, http.StatusBadRequest, "invalid form id")
		return
	}

	var input UpdateFormInput
	if err := c.ShouldBindJSON(&input); err != nil {
		respondError(c, http.StatusBadRequest, "invalid request body")
		return
	}

	if input.Title != nil {
		if strings.TrimSpace(*input.Title) == "" {
			respondError(c, http.StatusBadRequest, "title cannot be empty")
			return
		}
		if len(*input.Title) > 255 {
			respondError(c, http.StatusBadRequest, "title must be at most 255 characters")
			return
		}
	}

	existingForm, err := h.queries.GetForm(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(c, http.StatusNotFound, "form not found")
			return
		}
		respondError(c, http.StatusInternalServerError, "failed to get form")
		return
	}

	title := input.Title
	if title == nil {
		title = &existingForm.Title
	}

	var description sql.NullString
	if input.Description != nil {
		if *input.Description != "" {
			description = sql.NullString{String: *input.Description, Valid: true}
		}
	} else if existingForm.Description.Valid {
		description = existingForm.Description
	}

	var fieldsJSON []byte
	if input.Fields != nil {
		fieldsJSON, err = json.Marshal(input.Fields)
		if err != nil {
			respondError(c, http.StatusInternalServerError, "failed to serialize fields")
			return
		}
	} else {
		fieldsJSON = existingForm.Fields
	}

	form, err := h.queries.UpdateForm(c.Request.Context(), sqlcgen.UpdateFormParams{
		Title:       *title,
		Description: description,
		Fields:      fieldsJSON,
		ID:          id,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to update form")
		return
	}

	respondOK(c, http.StatusOK, formToResponse(form))
}

func (h *Handler) DeleteForm(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(c, http.StatusBadRequest, "invalid form id")
		return
	}

	err = h.queries.DeleteForm(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(c, http.StatusNotFound, "form not found")
			return
		}
		respondError(c, http.StatusInternalServerError, "failed to delete form")
		return
	}

	c.Status(http.StatusNoContent)
}

func formToResponse(form sqlcgen.Form) FormResponse {
	var fields []model.Field
	if len(form.Fields) > 0 {
		_ = json.Unmarshal(form.Fields, &fields)
	}

	response := FormResponse{
		ID:        form.ID.String(),
		Title:     form.Title,
		Fields:    fields,
		CreatedAt: form.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: form.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	if form.Description.Valid {
		response.Description = form.Description.String
	}

	return response
}
