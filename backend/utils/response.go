package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func JSONSuccess(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func JSONError(c *gin.Context, statusCode int, errorMessage string) {
	c.JSON(statusCode, APIResponse{
		Success: false,
		Error:   errorMessage,
	})
}

func JSONBadRequest(c *gin.Context, errorMessage string) {
	JSONError(c, http.StatusBadRequest, errorMessage)
}

func JSONNotFound(c *gin.Context, errorMessage string) {
	JSONError(c, http.StatusNotFound, errorMessage)
}

func JSONUnauthorized(c *gin.Context, errorMessage string) {
	JSONError(c, http.StatusUnauthorized, errorMessage)
}

func JSONInternalServerError(c *gin.Context, errorMessage string) {
	JSONError(c, http.StatusInternalServerError, errorMessage)
}
