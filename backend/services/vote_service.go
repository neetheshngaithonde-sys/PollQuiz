package services

import (
	"context"
	"errors"
	"strings"

	"poll-quiz-backend/models"
	"poll-quiz-backend/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type VoteService struct {
	pollRepo    *repository.PollRepository
	voteRepo    *repository.VoteRepository
	realtimeHub *RealtimeHub
}

func NewVoteService(pollRepo *repository.PollRepository, voteRepo *repository.VoteRepository, realtimeHub *RealtimeHub) *VoteService {
	return &VoteService{
		pollRepo:    pollRepo,
		voteRepo:    voteRepo,
		realtimeHub: realtimeHub,
	}
}

func (s *VoteService) SubmitVote(ctx context.Context, pollIDStr string, req *models.CastVoteRequest, clientIP string) (*models.PollResultsResponse, error) {
	pollObjID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return nil, errors.New("invalid poll ID format")
	}

	req.OptionID = strings.TrimSpace(req.OptionID)
	if req.OptionID == "" {
		return nil, errors.New("option_id is required")
	}

	// Use provided client fingerprint or fallback to IP
	fingerprint := strings.TrimSpace(req.Fingerprint)
	if fingerprint == "" {
		fingerprint = clientIP
	}

	// Check duplicate vote prevention
	hasVoted, err := s.voteRepo.HasVoted(ctx, pollObjID, fingerprint)
	if err != nil {
		return nil, errors.New("failed to verify voting status")
	}
	if hasVoted {
		return nil, errors.New("you have already cast your vote on this poll")
	}

	// Atomically increment the option votes and total votes
	updatedPoll, err := s.pollRepo.IncrementVote(ctx, pollObjID, req.OptionID)
	if err != nil {
		return nil, err
	}

	// Record vote log
	vote := &models.Vote{
		PollID:           pollObjID,
		OptionID:         req.OptionID,
		VoterFingerprint: fingerprint,
	}
	_ = s.voteRepo.RecordVote(ctx, vote)

	// Format results
	results := FormatPollResults(updatedPoll)

	// Publish to Redis Pub/Sub for genuine real-time broadcast
	go func() {
		bgCtx := context.Background()
		_ = s.realtimeHub.PublishUpdate(bgCtx, pollIDStr, results)
	}()

	return results, nil
}
