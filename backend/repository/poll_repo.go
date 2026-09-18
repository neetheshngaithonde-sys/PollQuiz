package repository

import (
	"context"
	"errors"
	"time"

	"poll-quiz-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PollRepository struct {
	collection *mongo.Collection
}

func NewPollRepository(db *mongo.Database) *PollRepository {
	return &PollRepository{
		collection: db.Collection("polls"),
	}
}

func (r *PollRepository) CreatePoll(ctx context.Context, poll *models.Poll) error {
	poll.ID = primitive.NewObjectID()
	poll.TotalVotes = 0
	poll.IsActive = true
	poll.CreatedAt = time.Now()
	poll.UpdatedAt = time.Now()

	_, err := r.collection.InsertOne(ctx, poll)
	return err
}

func (r *PollRepository) GetPollByID(ctx context.Context, id primitive.ObjectID) (*models.Poll, error) {
	var poll models.Poll
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&poll)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &poll, nil
}

func (r *PollRepository) GetPollsByUserID(ctx context.Context, userID primitive.ObjectID) ([]models.Poll, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.collection.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var polls []models.Poll
	if err := cursor.All(ctx, &polls); err != nil {
		return nil, err
	}

	if polls == nil {
		polls = []models.Poll{}
	}
	return polls, nil
}

func (r *PollRepository) IncrementVote(ctx context.Context, pollID primitive.ObjectID, optionID string) (*models.Poll, error) {
	filter := bson.M{
		"_id":        pollID,
		"is_active":  true,
		"options.id": optionID,
	}

	update := bson.M{
		"$inc": bson.M{
			"total_votes":          1,
			"options.$[elem].votes": 1,
		},
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	arrayFilters := options.ArrayFilters{
		Filters: []interface{}{
			bson.M{"elem.id": optionID},
		},
	}

	opts := options.FindOneAndUpdate().
		SetArrayFilters(arrayFilters).
		SetReturnDocument(options.After)

	var updatedPoll models.Poll
	err := r.collection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&updatedPoll)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("poll not found, inactive, or option does not exist")
		}
		return nil, err
	}

	return &updatedPoll, nil
}

func (r *PollRepository) TogglePollStatus(ctx context.Context, pollID, userID primitive.ObjectID, isActive bool) error {
	filter := bson.M{
		"_id":     pollID,
		"user_id": userID,
	}
	update := bson.M{
		"$set": bson.M{
			"is_active":  isActive,
			"updated_at": time.Now(),
		},
	}

	res, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("poll not found or unauthorized")
	}
	return nil
}

func (r *PollRepository) DeletePoll(ctx context.Context, pollID, userID primitive.ObjectID) error {
	filter := bson.M{
		"_id":     pollID,
		"user_id": userID,
	}
	res, err := r.collection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return errors.New("poll not found or unauthorized")
	}
	return nil
}
