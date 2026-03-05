package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	sqlcgen "odokoid-api/sqlc"
)

type CreateSubmissionInput struct {
	Responses map[string]any `json:"responses" binding:"required"`
}

type SubmissionResponse struct {
	ID          string         `json:"id"`
	FormID      string         `json:"formId"`
	Responses   map[string]any `json:"responses"`
	SubmittedAt string         `json:"submittedAt"`
}

func (h *Handler) CreateSubmission(c *gin.Context) {
	formIDStr := c.Param("id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		respondError(c, http.StatusBadRequest, "invalid form id")
		return
	}

	_, err = h.queries.GetFormPublic(c.Request.Context(), formID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(c, http.StatusNotFound, "form not found")
			return
		}
		respondError(c, http.StatusInternalServerError, "failed to verify form")
		return
	}

	var input CreateSubmissionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		respondError(c, http.StatusBadRequest, "responses is required")
		return
	}

	if len(input.Responses) == 0 {
		respondError(c, http.StatusBadRequest, "responses is required")
		return
	}

	responsesJSON, err := json.Marshal(input.Responses)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to serialize responses")
		return
	}

	submission, err := h.queries.CreateSubmission(c.Request.Context(), sqlcgen.CreateSubmissionParams{
		FormID:    formID,
		Responses: responsesJSON,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to create submission")
		return
	}

	respondOK(c, http.StatusCreated, submissionToResponse(submission))
}

func (h *Handler) ListSubmissions(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		respondError(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	formIDStr := c.Param("id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		respondError(c, http.StatusBadRequest, "invalid form id")
		return
	}

	_, err = h.queries.GetForm(c.Request.Context(), sqlcgen.GetFormParams{
		ID:     formID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(c, http.StatusNotFound, "form not found")
			return
		}
		respondError(c, http.StatusInternalServerError, "failed to verify form")
		return
	}

	submissions, err := h.queries.ListSubmissionsByForm(c.Request.Context(), formID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to list submissions")
		return
	}

	var response []SubmissionResponse
	for _, s := range submissions {
		response = append(response, submissionToResponse(s))
	}

	respondOK(c, http.StatusOK, response)
}

func (h *Handler) CountSubmissions(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		respondError(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	formIDStr := c.Param("id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		respondError(c, http.StatusBadRequest, "invalid form id")
		return
	}

	_, err = h.queries.GetForm(c.Request.Context(), sqlcgen.GetFormParams{
		ID:     formID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondError(c, http.StatusNotFound, "form not found")
			return
		}
		respondError(c, http.StatusInternalServerError, "failed to verify form")
		return
	}

	count, err := h.queries.CountSubmissionsByForm(c.Request.Context(), formID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to count submissions")
		return
	}

	respondOK(c, http.StatusOK, gin.H{"count": count})
}

func submissionToResponse(submission sqlcgen.Submission) SubmissionResponse {
	var responses map[string]any
	if len(submission.Responses) > 0 {
		_ = json.Unmarshal(submission.Responses, &responses)
	}

	return SubmissionResponse{
		ID:          submission.ID.String(),
		FormID:      submission.FormID.String(),
		Responses:   responses,
		SubmittedAt: submission.SubmittedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
