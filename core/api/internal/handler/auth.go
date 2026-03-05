package handler

import (
	"github.com/gin-gonic/gin"
)

func getUserID(c *gin.Context) (string, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		return "", false
	}
	return userID.(string), true
}
