package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"poll-quiz-backend/models"
)

func TestPollValidationAndVoting(t *testing.T) {
	server, _, _ := setupTestServer(t)
	defer server.Close()

	client := &http.Client{}

	// Register user
	uniqueEmail := fmt.Sprintf("polltest_%d@example.com", time.Now().UnixNano())
	regPayload, _ := json.Marshal(map[string]string{
		"name":     "Poll Tester",
		"email":    uniqueEmail,
		"password": "Password123!",
	})
	resp, err := http.Post(server.URL+"/api/auth/register", "application/json", bytes.NewBuffer(regPayload))
	if err != nil {
		t.Fatalf("Register failed: %v", err)
	}
	var regRes struct {
		Data models.AuthResponse `json:"data"`
	}
	json.NewDecoder(resp.Body).Decode(&regRes)
	token := regRes.Data.Token

	// 1. Validation Test: Question too short (< 5 chars)
	shortQPoll, _ := json.Marshal(map[string]interface{}{
		"question": "Why?",
		"options":  []string{"Option 1", "Option 2"},
	})
	reqShort, _ := http.NewRequest(http.MethodPost, server.URL+"/api/polls", bytes.NewBuffer(shortQPoll))
	reqShort.Header.Set("Authorization", "Bearer "+token)
	reqShort.Header.Set("Content-Type", "application/json")
	respShort, _ := client.Do(reqShort)
	if respShort.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for question < 5 chars, got %d", respShort.StatusCode)
	}

	// 2. Validation Test: Less than 2 options
	singleOptPoll, _ := json.Marshal(map[string]interface{}{
		"question": "What is your favorite cloud provider?",
		"options":  []string{"Only One Option"},
	})
	reqSingle, _ := http.NewRequest(http.MethodPost, server.URL+"/api/polls", bytes.NewBuffer(singleOptPoll))
	reqSingle.Header.Set("Authorization", "Bearer "+token)
	reqSingle.Header.Set("Content-Type", "application/json")
	respSingle, _ := client.Do(reqSingle)
	if respSingle.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for < 2 options, got %d", respSingle.StatusCode)
	}

	// 3. Validation Test: Valid Poll Creation
	validPollPayload, _ := json.Marshal(map[string]interface{}{
		"question": "Which backend framework is fastest?",
		"options":  []string{"Go (Gin)", "Node.js (Express)", "Python (FastAPI)"},
	})
	reqValid, _ := http.NewRequest(http.MethodPost, server.URL+"/api/polls", bytes.NewBuffer(validPollPayload))
	reqValid.Header.Set("Authorization", "Bearer "+token)
	reqValid.Header.Set("Content-Type", "application/json")
	respValid, err := client.Do(reqValid)
	if err != nil {
		t.Fatalf("Valid poll create error: %v", err)
	}
	if respValid.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created for valid poll, got %d", respValid.StatusCode)
	}

	var createdPollRes struct {
		Data models.Poll `json:"data"`
	}
	json.NewDecoder(respValid.Body).Decode(&createdPollRes)
	pollID := createdPollRes.Data.ID.Hex()
	if len(createdPollRes.Data.Options) != 3 {
		t.Fatalf("Expected 3 options created, got %d", len(createdPollRes.Data.Options))
	}
	optID := createdPollRes.Data.Options[0].ID

	// 4. Public Voting Test: First Vote by Device A
	fingerprintA := "device_A_" + fmt.Sprintf("%d", time.Now().UnixNano())
	votePayload, _ := json.Marshal(map[string]string{
		"option_id":   optID,
		"fingerprint": fingerprintA,
	})
	respVote1, err := http.Post(server.URL+"/api/polls/"+pollID+"/vote", "application/json", bytes.NewBuffer(votePayload))
	if err != nil {
		t.Fatalf("Vote 1 request failed: %v", err)
	}
	if respVote1.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for valid first vote, got %d", respVote1.StatusCode)
	}

	var voteRes struct {
		Data models.PollResultsResponse `json:"data"`
	}
	json.NewDecoder(respVote1.Body).Decode(&voteRes)
	if voteRes.Data.TotalVotes != 1 {
		t.Fatalf("Expected total votes 1, got %d", voteRes.Data.TotalVotes)
	}

	// 5. Public Voting Test: Duplicate Vote Rejection for Device A
	respVoteDup, _ := http.Post(server.URL+"/api/polls/"+pollID+"/vote", "application/json", bytes.NewBuffer(votePayload))
	if respVoteDup.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for duplicate vote from same device, got %d", respVoteDup.StatusCode)
	}

	// 6. Public Voting Test: Second Vote by Device B (Success)
	fingerprintB := "device_B_" + fmt.Sprintf("%d", time.Now().UnixNano())
	votePayloadB, _ := json.Marshal(map[string]string{
		"option_id":   createdPollRes.Data.Options[1].ID,
		"fingerprint": fingerprintB,
	})
	respVote2, _ := http.Post(server.URL+"/api/polls/"+pollID+"/vote", "application/json", bytes.NewBuffer(votePayloadB))
	if respVote2.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for vote 2, got %d", respVote2.StatusCode)
	}

	// 7. Toggle Poll Status (Close Poll)
	statusPayload, _ := json.Marshal(map[string]bool{
		"is_active": false,
	})
	reqStatus, _ := http.NewRequest(http.MethodPatch, server.URL+"/api/polls/"+pollID+"/status", bytes.NewBuffer(statusPayload))
	reqStatus.Header.Set("Authorization", "Bearer "+token)
	reqStatus.Header.Set("Content-Type", "application/json")
	respStatus, _ := client.Do(reqStatus)
	if respStatus.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK for status toggle, got %d", respStatus.StatusCode)
	}

	// 8. Voting on Closed Poll (Must Fail)
	fingerprintC := "device_C_" + fmt.Sprintf("%d", time.Now().UnixNano())
	votePayloadC, _ := json.Marshal(map[string]string{
		"option_id":   optID,
		"fingerprint": fingerprintC,
	})
	respClosedVote, _ := http.Post(server.URL+"/api/polls/"+pollID+"/vote", "application/json", bytes.NewBuffer(votePayloadC))
	if respClosedVote.StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request when voting on closed poll, got %d", respClosedVote.StatusCode)
	}
}
