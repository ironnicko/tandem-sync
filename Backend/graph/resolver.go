package graph

import (
	"context"
	"fmt"

	"github.com/ironnicko/tandem-sync/Backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

func getGeoLocation(lat *float64, lng *float64) (*models.GeoLocation, error) {
	if lat != nil && lng != nil {
		return &models.GeoLocation{Lat: *lat, Lng: *lng}, nil
	}
	return nil, fmt.Errorf("Latitute or Longitude wasn't provided!")
}

func getUsersFromRideParticipants(ctx context.Context, ride models.Ride, usersColl *mongo.Collection) (*[]models.DBUsers, error) {
	participantIDs := make([]primitive.ObjectID, 0, len(ride.Participants))
	for _, participant := range ride.Participants {
		participantIDs = append(participantIDs, participant.UserID)
	}

	cursor, err := usersColl.Find(ctx, bson.M{"_id": bson.M{"$in": participantIDs}})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch users: %w", err)
	}
	defer cursor.Close(ctx)

	var users []models.DBUsers
	if err := cursor.All(ctx, &users); err != nil {
		return nil, fmt.Errorf("failed to decode users: %w", err)
	}

	return &users, nil
}

type Resolver struct{}
