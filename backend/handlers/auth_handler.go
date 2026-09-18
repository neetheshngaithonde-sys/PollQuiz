package handlers

import (
	"net/http"

	"poll-quiz-backend/models"
	"poll-quiz-backend/services"
	"poll-quiz-backend/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, "Invalid input: "+err.Error())
		return
	}

	res, err := h.authService.Register(c.Request.Context(), &req)
	if err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusCreated, "User registered successfully", res)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, "Invalid input: "+err.Error())
		return
	}

	res, err := h.authService.Login(c.Request.Context(), &req)
	if err != nil {
		utils.JSONUnauthorized(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusOK, "Login successful", res)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.JSONUnauthorized(c, "Unauthorized")
		return
	}

	user, err := h.authService.GetMe(c.Request.Context(), userID.(string))
	if err != nil {
		utils.JSONNotFound(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusOK, "Profile retrieved successfully", user)
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.JSONUnauthorized(c, "Unauthorized")
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, "Invalid input: "+err.Error())
		return
	}

	if err := h.authService.ChangePassword(c.Request.Context(), userID.(string), &req); err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusOK, "Password updated successfully", nil)
}
