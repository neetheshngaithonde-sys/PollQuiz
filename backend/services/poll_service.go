package services

import (
	"context"
	"errors"
	"math"
	"strings"

	"poll-quiz-backend/models"
	"poll-quiz-backend/repository"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PollService struct {
	pollRepo *repository.PollRepository
	voteRepo *repository.VoteRepository
}

func NewPollService(pollRepo *repository.PollRepository, voteRepo *repository.VoteRepository) *PollService {
	return &PollService{
		pollRepo: pollRepo,
		voteRepo: voteRepo,
	}
}

func (s *PollService) CreatePoll(ctx context.Context, userIDStr string, req *models.CreatePollRequest) (*models.Poll, error) {
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	cleanedQuestion := strings.TrimSpace(req.Question)
	if len(cleanedQuestion) < 5 {
		return nil, errors.New("question must be at least 5 characters long")
	}

	// Clean and deduplicate options
	seen := make(map[string]bool)
	var optionsList []models.Option
	for _, opt := range req.Options {
		trimmed := strings.TrimSpace(opt)
		if trimmed != "" && !seen[strings.ToLower(trimmed)] {
			seen[strings.ToLower(trimmed)] = true
			optionsList = append(optionsList, models.Option{
				ID:    uuid.New().String()[:8], // compact unique 8-char option ID
				Text:  trimmed,
				Votes: 0,
			})
		}
	}

	if len(optionsList) < 2 {
		return nil, errors.New("poll must contain at least 2 distinct non-empty options")
	}

	poll := &models.Poll{
		UserID:   userObjID,
		Question: cleanedQuestion,
		Options:  optionsList,
	}

	if err := s.pollRepo.CreatePoll(ctx, poll); err != nil {
		return nil, errors.New("failed to save poll")
	}

	return poll, nil
}

func (s *PollService) GetPoll(ctx context.Context, pollIDStr string) (*models.Poll, error) {
	pollObjID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return nil, errors.New("invalid poll ID")
	}

	poll, err := s.pollRepo.GetPollByID(ctx, pollObjID)
	if err != nil {
		return nil, err
	}
	if poll == nil {
		return nil, errors.New("poll not found")
	}

	return poll, nil
}

func (s *PollService) GetPollResults(ctx context.Context, pollIDStr string) (*models.PollResultsResponse, error) {
	poll, err := s.GetPoll(ctx, pollIDStr)
	if err != nil {
		return nil, err
	}

	return FormatPollResults(poll), nil
}

func (s *PollService) GetUserPolls(ctx context.Context, userIDStr string) ([]models.Poll, error) {
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	return s.pollRepo.GetPollsByUserID(ctx, userObjID)
}

func (s *PollService) TogglePollStatus(ctx context.Context, pollIDStr, userIDStr string, isActive bool) error {
	pollObjID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return errors.New("invalid poll ID")
	}
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return errors.New("invalid user ID")
	}

	return s.pollRepo.TogglePollStatus(ctx, pollObjID, userObjID, isActive)
}

func (s *PollService) DeletePoll(ctx context.Context, pollIDStr, userIDStr string) error {
	pollObjID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return errors.New("invalid poll ID")
	}
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return errors.New("invalid user ID")
	}

	if err := s.pollRepo.DeletePoll(ctx, pollObjID, userObjID); err != nil {
		return err
	}

	// Clean up related votes
	_ = s.voteRepo.DeleteVotesByPollID(ctx, pollObjID)
	return nil
}

func FormatPollResults(poll *models.Poll) *models.PollResultsResponse {
	var resultOptions []models.PollResultOption

	for _, opt := range poll.Options {
		var pct float64 = 0
		if poll.TotalVotes > 0 {
			pct = (float64(opt.Votes) / float64(poll.TotalVotes)) * 100
			pct = math.Round(pct*10) / 10 // 1 decimal place
		}

		resultOptions = append(resultOptions, models.PollResultOption{
			ID:         opt.ID,
			Text:       opt.Text,
			Votes:      opt.Votes,
			Percentage: pct,
		})
	}

	return &models.PollResultsResponse{
		ID:         poll.ID.Hex(),
		Question:   poll.Question,
		TotalVotes: poll.TotalVotes,
		IsActive:   poll.IsActive,
		Options:    resultOptions,
		CreatedAt:  poll.CreatedAt,
		UpdatedAt:  poll.UpdatedAt,
	}
}
