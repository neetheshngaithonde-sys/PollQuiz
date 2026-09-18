package main

import (
	"context"
	"encoding/json"
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

func TestRealtimePollFlow(t *testing.T) {
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

	// 1. Register test user
	regReq := models.RegisterRequest{
		Name:     "Test Flow User",
		Email:    "flow_" + time.Now().Format("20060102150405") + "@test.com",
		Password: "Password123!",
	}
	authRes, err := authService.Register(ctx, &regReq)
	if err != nil {
		t.Fatalf("Register failed: %v", err)
	}

	// 2. Create a Poll
	pollReq := models.CreatePollRequest{
		Question: "Realtime Test Poll " + time.Now().Format("15:04:05"),
		Options:  []string{"Option Alpha", "Option Beta"},
	}
	createdPoll, err := pollService.CreatePoll(ctx, authRes.User.ID, &pollReq)
	if err != nil {
		t.Fatalf("Create poll failed: %v", err)
	}
	pollID := createdPoll.ID.Hex()
	optID := createdPoll.Options[0].ID

	// 3. Connect Client A via WebSocket to /ws/polls/:id
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws/polls/" + pollID
	wsConn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("WebSocket connection failed: %v", err)
	}
	defer wsConn.Close()

	// Read Initial State from WebSocket
	_, initialMsgBytes, err := wsConn.ReadMessage()
	if err != nil {
		t.Fatalf("Failed to read initial WS message: %v", err)
	}
	var initMsg models.LiveUpdateMessage
	if err := json.Unmarshal(initialMsgBytes, &initMsg); err != nil {
		t.Fatalf("Failed to parse initial WS JSON: %v", err)
	}
	if initMsg.Results.TotalVotes != 0 {
		t.Errorf("Expected initial total votes 0, got %d", initMsg.Results.TotalVotes)
	}

	// Channel to receive live update from WebSocket reader goroutine
	updateChan := make(chan models.LiveUpdateMessage, 1)
	go func() {
		_, msgBytes, err := wsConn.ReadMessage()
		if err != nil {
			return
		}
		var updateMsg models.LiveUpdateMessage
		if err := json.Unmarshal(msgBytes, &updateMsg); err == nil {
			updateChan <- updateMsg
		}
	}()

	// 4. Cast a Vote via VoteService (simulating Audience voter)
	voteReq := models.CastVoteRequest{
		OptionID:    optID,
		Fingerprint: "device_fingerprint_" + time.Now().Format("150405"),
	}
	voteResults, err := voteService.SubmitVote(ctx, pollID, &voteReq, "127.0.0.1")
	if err != nil {
		t.Fatalf("Vote submission failed: %v", err)
	}
	if voteResults.TotalVotes != 1 {
		t.Errorf("Expected total votes 1, got %d", voteResults.TotalVotes)
	}

	// 5. Verify Client A receives the live update over WebSocket driven by Redis Pub/Sub!
	select {
	case receivedUpdate := <-updateChan:
		t.Logf("SUCCESS! Received real-time live update over WebSocket: Type=%s, TotalVotes=%d, Option 0 Votes=%d (%v%%)",
			receivedUpdate.Type,
			receivedUpdate.Results.TotalVotes,
			receivedUpdate.Results.Options[0].Votes,
			receivedUpdate.Results.Options[0].Percentage,
		)
		if receivedUpdate.Results.TotalVotes != 1 {
			t.Errorf("Expected updated total votes 1, got %d", receivedUpdate.Results.TotalVotes)
		}
		if receivedUpdate.Results.Options[0].Votes != 1 {
			t.Errorf("Expected option votes 1, got %d", receivedUpdate.Results.Options[0].Votes)
		}
	case <-time.After(5 * time.Second):
		t.Fatalf("Timeout: Did not receive real-time Redis/WebSocket broadcast within 5 seconds")
	}
}
