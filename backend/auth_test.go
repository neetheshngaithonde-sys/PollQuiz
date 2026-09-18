package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"poll-quiz-backend/config"
	"poll-quiz-backend/handlers"
	"poll-quiz-backend/models"
	"poll-quiz-backend/repository"
	"poll-quiz-backend/routes"
	"poll-quiz-backend/services"
)

func setupTestServer(t *testing.T) (*httptest.Server, *config.Config, *services.AuthService) {
	cfg := config.LoadConfig()
	db, err := config.ConnectMongoDB(cfg)
	if err != nil {
		t.Fatalf("MongoDB connect error: %v", err)
	}

	redisClient, err := config.ConnectRedis(cfg)
	if err != nil {
		t.Fatalf("Redis connect error: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	pollRepo := repository.NewPollRepository(db)
	voteRepo := repository.NewVoteRepository(db)

	realtimeHub := services.NewRealtimeHub(redisClient)
	go realtimeHub.Run()

	authService := services.NewAuthService(userRepo, cfg)
	pollService := services.NewPollService(pollRepo, voteRepo)
	voteService := services.NewVoteService(pollRepo, voteRepo, realtimeHub)

	authHandler := handlers.NewAuthHandler(authService)
	pollHandler := handlers.NewPollHandler(pollService)
	voteHandler := handlers.NewVoteHandler(voteService)
	wsHandler := handlers.NewWebSocketHandler(realtimeHub, pollService)

	router := routes.SetupRouter(cfg, authHandler, pollHandler, voteHandler, wsHandler)
	server := httptest.NewServer(router)

	return server, cfg, authService
}

func TestAuthFlowAndChangePassword(t *testing.T) {
	server, _, _ := setupTestServer(t)
	defer server.Close()

	uniqueEmail := fmt.Sprintf("authtest_%d@example.com", time.Now().UnixNano())
	initialPassword := "OriginalPass123!"
	newPassword := "NewSecretPass456!"

	// 1. Test Registration - Valid
	regPayload, _ := json.Marshal(map[string]string{
		"name":     "Auth Test User",
		"email":    uniqueEmail,
		"password": initialPassword,
	})

	resp, err := http.Post(server.URL+"/api/auth/register", "application/json", bytes.NewBuffer(regPayload))
	if err != nil {
		t.Fatalf("Register request failed: %v", err)
	}
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for register, got %d", resp.StatusCode)
	}

	var regRes struct {
		Success bool                `json:"success"`
		Data    models.AuthResponse `json:"data"`
	}
	json.NewDecoder(resp.Body).Decode(&regRes)
	token := regRes.Data.Token
	if token == "" {
		t.Fatal("Expected JWT token upon registration, got empty string")
	}

	// 2. Test Registration - Duplicate Email Rejection
	respDup, err := http.Post(server.URL+"/api/auth/register", "application/json", bytes.NewBuffer(regPayload))
	if err != nil {
		t.Fatalf("Duplicate register request failed: %v", err)
	}
	if respDup.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for duplicate email, got %d", respDup.StatusCode)
	}

	// 3. Test Login - Success
	loginPayload, _ := json.Marshal(map[string]string{
		"email":    uniqueEmail,
		"password": initialPassword,
	})
	respLogin, err := http.Post(server.URL+"/api/auth/login", "application/json", bytes.NewBuffer(loginPayload))
	if err != nil {
		t.Fatalf("Login request failed: %v", err)
	}
	if respLogin.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for valid login, got %d", respLogin.StatusCode)
	}

	// 4. Test Login - Invalid Password Rejection
	wrongLoginPayload, _ := json.Marshal(map[string]string{
		"email":    uniqueEmail,
		"password": "WrongPassword999!",
	})
	respWrong, _ := http.Post(server.URL+"/api/auth/login", "application/json", bytes.NewBuffer(wrongLoginPayload))
	if respWrong.StatusCode != http.StatusUnauthorized {
		t.Fatalf("Expected 401 Unauthorized for bad password, got %d", respWrong.StatusCode)
	}

	// 5. Test Change Password - Incorrect Current Password
	badChangePayload, _ := json.Marshal(map[string]string{
		"current_password": "IncorrectPassword!",
		"new_password":     newPassword,
	})
	reqBadChange, _ := http.NewRequest(http.MethodPut, server.URL+"/api/auth/change-password", bytes.NewBuffer(badChangePayload))
	reqBadChange.Header.Set("Authorization", "Bearer "+token)
	reqBadChange.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	respBadChange, err := client.Do(reqBadChange)
	if err != nil {
		t.Fatalf("Bad change password request error: %v", err)
	}
	if respBadChange.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request when current password is wrong, got %d", respBadChange.StatusCode)
	}

	// 6. Test Change Password - Same As Current Password Rejection
	sameChangePayload, _ := json.Marshal(map[string]string{
		"current_password": initialPassword,
		"new_password":     initialPassword,
	})
	reqSameChange, _ := http.NewRequest(http.MethodPut, server.URL+"/api/auth/change-password", bytes.NewBuffer(sameChangePayload))
	reqSameChange.Header.Set("Authorization", "Bearer "+token)
	reqSameChange.Header.Set("Content-Type", "application/json")
	respSameChange, _ := client.Do(reqSameChange)
	if respSameChange.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request when new password is same as current, got %d", respSameChange.StatusCode)
	}

	// 7. Test Change Password - Success
	goodChangePayload, _ := json.Marshal(map[string]string{
		"current_password": initialPassword,
		"new_password":     newPassword,
	})
	reqGoodChange, _ := http.NewRequest(http.MethodPut, server.URL+"/api/auth/change-password", bytes.NewBuffer(goodChangePayload))
	reqGoodChange.Header.Set("Authorization", "Bearer "+token)
	reqGoodChange.Header.Set("Content-Type", "application/json")
	respGoodChange, err := client.Do(reqGoodChange)
	if err != nil {
		t.Fatalf("Good change password request error: %v", err)
	}
	if respGoodChange.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for successful password change, got %d", respGoodChange.StatusCode)
	}

	// 8. Test Login with Old Password (MUST FAIL)
	respOldLogin, _ := http.Post(server.URL+"/api/auth/login", "application/json", bytes.NewBuffer(loginPayload))
	if respOldLogin.StatusCode != http.StatusUnauthorized {
		t.Fatalf("Expected 401 Unauthorized when logging in with old password, got %d", respOldLogin.StatusCode)
	}

	// 9. Test Login with New Password (MUST SUCCEED)
	newLoginPayload, _ := json.Marshal(map[string]string{
		"email":    uniqueEmail,
		"password": newPassword,
	})
	respNewLogin, _ := http.Post(server.URL+"/api/auth/login", "application/json", bytes.NewBuffer(newLoginPayload))
	if respNewLogin.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK when logging in with new password, got %d", respNewLogin.StatusCode)
	}
}
