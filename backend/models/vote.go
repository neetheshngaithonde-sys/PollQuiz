package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Vote struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PollID           primitive.ObjectID `bson:"poll_id" json:"poll_id"`
	OptionID         string             `bson:"option_id" json:"option_id"`
	VoterFingerprint string             `bson:"voter_fingerprint" json:"voter_fingerprint"`
	VotedAt          time.Time          `bson:"voted_at" json:"voted_at"`
}

type CastVoteRequest struct {
	OptionID    string `json:"option_id" binding:"required"`
	Fingerprint string `json:"fingerprint"`
}
