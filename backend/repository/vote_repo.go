package repository

import (
	"context"
	"time"

	"poll-quiz-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type VoteRepository struct {
	collection *mongo.Collection
}

func NewVoteRepository(db *mongo.Database) *VoteRepository {
	return &VoteRepository{
		collection: db.Collection("votes"),
	}
}

func (r *VoteRepository) HasVoted(ctx context.Context, pollID primitive.ObjectID, fingerprint string) (bool, error) {
	if fingerprint == "" {
		return false, nil
	}

	filter := bson.M{
		"poll_id":           pollID,
		"voter_fingerprint": fingerprint,
	}

	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *VoteRepository) RecordVote(ctx context.Context, vote *models.Vote) error {
	vote.ID = primitive.NewObjectID()
	vote.VotedAt = time.Now()

	_, err := r.collection.InsertOne(ctx, vote)
	return err
}

func (r *VoteRepository) DeleteVotesByPollID(ctx context.Context, pollID primitive.ObjectID) error {
	_, err := r.collection.DeleteMany(ctx, bson.M{"poll_id": pollID})
	return err
}
