package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Option struct {
	ID    string `bson:"id" json:"id"`
	Text  string `bson:"text" json:"text"`
	Votes int64  `bson:"votes" json:"votes"`
}

type Poll struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID     primitive.ObjectID `bson:"user_id" json:"user_id"`
	Question   string             `bson:"question" json:"question"`
	Options    []Option           `bson:"options" json:"options"`
	TotalVotes int64              `bson:"total_votes" json:"total_votes"`
	IsActive   bool               `bson:"is_active" json:"is_active"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time          `bson:"updated_at" json:"updated_at"`
}

type CreatePollRequest struct {
	Question string   `json:"question" binding:"required,min=5,max=250"`
	Options  []string `json:"options" binding:"required,min=2,max=10,dive,required,min=1,max=100"`
}

type PollResultOption struct {
	ID         string  `json:"id"`
	Text       string  `json:"text"`
	Votes      int64   `json:"votes"`
	Percentage float64 `json:"percentage"`
}

type PollResultsResponse struct {
	ID         string             `json:"id"`
	Question   string             `json:"question"`
	TotalVotes int64              `json:"total_votes"`
	IsActive   bool               `json:"is_active"`
	Options    []PollResultOption `json:"options"`
	CreatedAt  time.Time          `json:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at"`
}

type LiveUpdateMessage struct {
	Type      string              `json:"type"` // "VOTE_UPDATE" | "POLL_STATUS"
	PollID    string              `json:"poll_id"`
	Results   PollResultsResponse `json:"results"`
	Timestamp time.Time           `json:"timestamp"`
}
