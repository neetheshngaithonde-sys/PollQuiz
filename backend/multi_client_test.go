package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"poll-quiz-backend/config"
	"poll-quiz-backend/handlers"
	"poll-quiz-backend/models"
	"poll-quiz-backend/repository"
	"poll-quiz-backend/routes"
	"poll-quiz-backend/services"

	"github.com/gorilla/websocket"
)

func TestBidirectionalMultiClientVoting(t *testing.T) {
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
	defer server.Close()

	ctx := context.Background()

	// 1. Create a User and a Poll with 3 options
	regReq := models.RegisterRequest{
		Name:     "MultiClient Creator",
		Email:    fmt.Sprintf("multiclient_%d@example.com", time.Now().UnixNano()),
		Password: "Password123!",
	}
	authRes, err := authService.Register(ctx, &regReq)
	if err != nil {
		t.Fatalf("Registration failed: %v", err)
	}

	pollReq := models.CreatePollRequest{
		Question: "Which database do you prefer?",
		Options:  []string{"MongoDB", "PostgreSQL", "Redis"},
	}
	poll, err := pollService.CreatePoll(ctx, authRes.User.ID, &pollReq)
	if err != nil {
		t.Fatalf("CreatePoll failed: %v", err)
	}
	pollID := poll.ID.Hex()
	opt0 := poll.Options[0].ID
	opt1 := poll.Options[1].ID

	// 2. Open Window A (WebSocket Client A)
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws/polls/" + pollID
	wsConnA, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Window A WebSocket dial failed: %v", err)
	}
	defer wsConnA.Close()

	// Read initial state on Window A
	_, initMsgA, err := wsConnA.ReadMessage()
	if err != nil {
		t.Fatalf("Window A read initial message error: %v", err)
	}
	var initParsed models.LiveUpdateMessage
	json.Unmarshal(initMsgA, &initParsed)
	if initParsed.Results.TotalVotes != 0 {
		t.Fatalf("Expected initial votes 0, got %d", initParsed.Results.TotalVotes)
	}

	// 3. Open Window B (WebSocket Client B)
	wsConnB, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Window B WebSocket dial failed: %v", err)
	}
	defer wsConnB.Close()

	// Read initial state on Window B
	_, _, err = wsConnB.ReadMessage()
	if err != nil {
		t.Fatalf("Window B read initial message error: %v", err)
	}

	// Listeners for updates
	chanA := make(chan models.LiveUpdateMessage, 5)
	chanB := make(chan models.LiveUpdateMessage, 5)

	go func() {
		for {
			_, msg, err := wsConnA.ReadMessage()
			if err != nil {
				return
			}
			var update models.LiveUpdateMessage
			if err := json.Unmarshal(msg, &update); err == nil {
				chanA <- update
			}
		}
	}()

	go func() {
		for {
			_, msg, err := wsConnB.ReadMessage()
			if err != nil {
				return
			}
			var update models.LiveUpdateMessage
			if err := json.Unmarshal(msg, &update); err == nil {
				chanB <- update
			}
		}
	}()

	// 4. ACTION 1: Window A casts a vote for MongoDB (Option 0)
	voteReq1 := models.CastVoteRequest{
		OptionID:    opt0,
		Fingerprint: "fingerprint_window_A",
	}
	_, err = voteService.SubmitVote(ctx, pollID, &voteReq1, "192.168.1.10")
	if err != nil {
		t.Fatalf("Vote 1 submit error: %v", err)
	}

	// VERIFY: Window B receives the real-time vote update!
	select {
	case updateB := <-chanB:
		t.Logf("PASS: Window B received live Redis broadcast: TotalVotes=%d, Opt0 Votes=%d (%v%%)",
			updateB.Results.TotalVotes, updateB.Results.Options[0].Votes, updateB.Results.Options[0].Percentage)
		if updateB.Results.TotalVotes != 1 {
			t.Fatalf("Expected total votes 1 on Window B, got %d", updateB.Results.TotalVotes)
		}
		if updateB.Results.Options[0].Votes != 1 {
			t.Fatalf("Expected option 0 votes 1 on Window B, got %d", updateB.Results.Options[0].Votes)
		}
	case <-time.After(3 * time.Second):
		t.Fatalf("Timeout: Window B did not receive live update after Window A voted")
	}

	// Window A also receives the update
	select {
	case updateA := <-chanA:
		if updateA.Results.TotalVotes != 1 {
			t.Fatalf("Expected total votes 1 on Window A, got %d", updateA.Results.TotalVotes)
		}
	case <-time.After(3 * time.Second):
		t.Fatalf("Timeout: Window A did not receive self-broadcast")
	}

	// 5. ACTION 2: Window B casts a vote for PostgreSQL (Option 1) in opposite direction
	voteReq2 := models.CastVoteRequest{
		OptionID:    opt1,
		Fingerprint: "fingerprint_window_B",
	}
	_, err = voteService.SubmitVote(ctx, pollID, &voteReq2, "192.168.1.20")
	if err != nil {
		t.Fatalf("Vote 2 submit error: %v", err)
	}

	// VERIFY: Window A receives the real-time vote update from Window B!
	select {
	case updateA := <-chanA:
		t.Logf("PASS: Window A received live Redis broadcast from Window B: TotalVotes=%d, Opt0=%d (50%%), Opt1=%d (50%%)",
			updateA.Results.TotalVotes, updateA.Results.Options[0].Votes, updateA.Results.Options[1].Votes)
		if updateA.Results.TotalVotes != 2 {
			t.Fatalf("Expected total votes 2 on Window A, got %d", updateA.Results.TotalVotes)
		}
		if updateA.Results.Options[1].Votes != 1 {
			t.Fatalf("Expected option 1 votes 1 on Window A, got %d", updateA.Results.Options[1].Votes)
		}
	case <-time.After(3 * time.Second):
		t.Fatalf("Timeout: Window A did not receive live update after Window B voted")
	}

	// VERIFY: Window B receives its updated count as well
	select {
	case updateB := <-chanB:
		if updateB.Results.TotalVotes != 2 {
			t.Fatalf("Expected total votes 2 on Window B, got %d", updateB.Results.TotalVotes)
		}
	case <-time.After(3 * time.Second):
		t.Fatalf("Timeout: Window B did not receive second update")
	}
}
