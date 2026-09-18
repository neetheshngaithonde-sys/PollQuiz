package handlers

import (
	"log"

	"poll-quiz-backend/services"
	"poll-quiz-backend/utils"

	"github.com/gin-gonic/gin"
)

type WebSocketHandler struct {
	realtimeHub *services.RealtimeHub
	pollService *services.PollService
}

func NewWebSocketHandler(realtimeHub *services.RealtimeHub, pollService *services.PollService) *WebSocketHandler {
	return &WebSocketHandler{
		realtimeHub: realtimeHub,
		pollService: pollService,
	}
}

func (h *WebSocketHandler) HandlePollWebSocket(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		utils.JSONBadRequest(c, "Poll ID is required")
		return
	}

	// Fetch current poll results as initial state
	results, err := h.pollService.GetPollResults(c.Request.Context(), pollID)
	if err != nil {
		log.Printf("[WebSocket] Warning: could not load initial poll %s: %v", pollID, err)
	}

	h.realtimeHub.ServeWebSocket(c.Writer, c.Request, pollID, results)
}
