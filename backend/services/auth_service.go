package services

import (
	"context"
	"errors"
	"strings"

	"poll-quiz-backend/config"
	"poll-quiz-backend/models"
	"poll-quiz-backend/repository"
	"poll-quiz-backend/utils"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthService struct {
	userRepo *repository.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		cfg:      cfg,
	}
}

func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Name = strings.TrimSpace(req.Name)

	existingUser, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("an account with this email already exists")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &models.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: hashedPassword,
	}

	if err := s.userRepo.CreateUser(ctx, user); err != nil {
		return nil, errors.New("failed to create user account")
	}

	token, err := utils.GenerateJWT(user.ID.Hex(), user.Email, s.cfg.JWTSecret)
	if err != nil {
		return nil, errors.New("failed to generate authentication token")
	}

	return &models.AuthResponse{
		Token: token,
		User: models.UserResponse{
			ID:        user.ID.Hex(),
			Name:      user.Name,
			Email:     user.Email,
			CreatedAt: user.CreatedAt,
		},
	}, nil
}

func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest) (*models.AuthResponse, error) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid email or password")
	}

	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid email or password")
	}

	token, err := utils.GenerateJWT(user.ID.Hex(), user.Email, s.cfg.JWTSecret)
	if err != nil {
		return nil, errors.New("failed to generate authentication token")
	}

	return &models.AuthResponse{
		Token: token,
		User: models.UserResponse{
			ID:        user.ID.Hex(),
			Name:      user.Name,
			Email:     user.Email,
			CreatedAt: user.CreatedAt,
		},
	}, nil
}

func (s *AuthService) GetMe(ctx context.Context, userIDStr string) (*models.UserResponse, error) {
	objID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	user, err := s.userRepo.FindByID(ctx, objID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	return &models.UserResponse{
		ID:        user.ID.Hex(),
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *AuthService) ChangePassword(ctx context.Context, userIDStr string, req *models.ChangePasswordRequest) error {
	objID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return errors.New("invalid user ID")
	}

	user, err := s.userRepo.FindByID(ctx, objID)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}

	if !utils.CheckPasswordHash(req.CurrentPassword, user.PasswordHash) {
		return errors.New("current password is incorrect")
	}

	if len(req.NewPassword) < 6 {
		return errors.New("new password must be at least 6 characters long")
	}

	if utils.CheckPasswordHash(req.NewPassword, user.PasswordHash) {
		return errors.New("new password cannot be the same as your current password")
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return errors.New("failed to hash new password")
	}

	if err := s.userRepo.UpdatePassword(ctx, objID, hashedPassword); err != nil {
		return errors.New("failed to update password in database")
	}

	return nil
}
