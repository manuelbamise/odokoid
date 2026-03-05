package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	sqlcgen "odokoid-api/sqlc"
)

type UserResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type SyncUserInput struct {
	ID    string `json:"id" binding:"required"`
	Email string `json:"email" binding:"required"`
}

func (h *Handler) SyncUser(c *gin.Context) {
	var input SyncUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		respondError(c, http.StatusBadRequest, "invalid request")
		return
	}

	user, err := h.queries.UpsertUser(c.Request.Context(), sqlcgen.UpsertUserParams{
		ID:    input.ID,
		Email: input.Email,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to sync user")
		return
	}

	respondOK(c, http.StatusOK, userToResponse(user))
}

func userToResponse(user sqlcgen.User) UserResponse {
	return UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: user.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
