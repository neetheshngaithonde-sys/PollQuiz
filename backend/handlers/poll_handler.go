package handlers

import (
	"net/http"

	"poll-quiz-backend/models"
	"poll-quiz-backend/services"
	"poll-quiz-backend/utils"

	"github.com/gin-gonic/gin"
)

type PollHandler struct {
	pollService *services.PollService
}

func NewPollHandler(pollService *services.PollService) *PollHandler {
	return &PollHandler{
		pollService: pollService,
	}
}

func (h *PollHandler) CreatePoll(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.JSONUnauthorized(c, "Authentication required to create a poll")
		return
	}

	var req models.CreatePollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, "Invalid poll payload: "+err.Error())
		return
	}

	poll, err := h.pollService.CreatePoll(c.Request.Context(), userID.(string), &req)
	if err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusCreated, "Poll created successfully", poll)
}

func (h *PollHandler) GetPoll(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		utils.JSONBadRequest(c, "Poll ID is required")
		return
	}

	poll, err := h.pollService.GetPoll(c.Request.Context(), pollID)
	if err != nil {
		utils.JSONNotFound(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusOK, "Poll retrieved successfully", poll)
}

func (h *PollHandler) GetPollResults(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		utils.JSONBadRequest(c, "Poll ID is required")
		return
	}

	results, err := h.pollService.GetPollResults(c.Request.Context(), pollID)
	if err != nil {
		utils.JSONNotFound(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusOK, "Poll results retrieved successfully", results)
}

func (h *PollHandler) GetUserPolls(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.JSONUnauthorized(c, "Authentication required")
		return
	}

	polls, err := h.pollService.GetUserPolls(c.Request.Context(), userID.(string))
	if err != nil {
		utils.JSONInternalServerError(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusOK, "User polls retrieved successfully", polls)
}

type ToggleStatusRequest struct {
	IsActive bool `json:"is_active"`
}

func (h *PollHandler) TogglePollStatus(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.JSONUnauthorized(c, "Authentication required")
		return
	}

	pollID := c.Param("id")
	var req ToggleStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, "Invalid status payload: "+err.Error())
		return
	}

	err := h.pollService.TogglePollStatus(c.Request.Context(), pollID, userID.(string), req.IsActive)
	if err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusOK, "Poll status updated successfully", gin.H{"is_active": req.IsActive})
}

func (h *PollHandler) DeletePoll(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.JSONUnauthorized(c, "Authentication required")
		return
	}

	pollID := c.Param("id")
	err := h.pollService.DeletePoll(c.Request.Context(), pollID, userID.(string))
	if err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusOK, "Poll deleted successfully", nil)
}
