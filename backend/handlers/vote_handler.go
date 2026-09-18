package handlers

import (
	"net/http"

	"poll-quiz-backend/models"
	"poll-quiz-backend/services"
	"poll-quiz-backend/utils"

	"github.com/gin-gonic/gin"
)

type VoteHandler struct {
	voteService *services.VoteService
}

func NewVoteHandler(voteService *services.VoteService) *VoteHandler {
	return &VoteHandler{
		voteService: voteService,
	}
}

func (h *VoteHandler) SubmitVote(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		utils.JSONBadRequest(c, "Poll ID is required")
		return
	}

	var req models.CastVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, "Invalid vote payload: "+err.Error())
		return
	}

	clientIP := c.ClientIP()
	results, err := h.voteService.SubmitVote(c.Request.Context(), pollID, &req, clientIP)
	if err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	utils.JSONSuccess(c, http.StatusOK, "Vote cast successfully", results)
}
