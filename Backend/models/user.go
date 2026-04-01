package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PushSubscription struct {
	Endpoint string               `json:"endpoint"`
	Keys     PushSubscriptionKeys `json:"keys"`
}

type PushSubscriptionKeys struct {
	P256dh string `json:"p256dh"`
	Auth   string `json:"auth"`
}

type DBUsers struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	IsActive         bool               `bson:"isActive" json:"isActive"`
	CurrentRide       *string             `bson:"currentRide,omitempty" json:"currentRide,omitempty"`
	PushSubscriptions []*PushSubscription `bson:"pushSubscriptions,omitempty" json:"pushSubscriptions,omitempty"`
}

type BetterAuthUser struct {
	ID            primitive.ObjectID `json:"id" bson:"_id"`
	Name          string             `json:"name" bson:"name"`
	Email         string             `json:"email" bson:"email"`
	EmailVerified bool               `json:"emailVerified" bson:"emailVerified"`
	Image         string             `json:"image,omitempty" bson:"image,omitempty"`
	CreatedAt     time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt     time.Time          `json:"updatedAt" bson:"updatedAt"`

	// Populated from joins — not stored in the user document
	// Accounts []BetterAuthAccount `json:"accounts,omitempty" bson:"accounts,omitempty"`
	// Sessions []BetterAuthSession `json:"sessions,omitempty" bson:"sessions,omitempty"`
}

type User struct {
	// from BetterAuthUser
	ID            primitive.ObjectID `json:"id" bson:"_id"`
	Name          string             `json:"name" bson:"name"`
	Email         string             `json:"email" bson:"email"`
	EmailVerified bool               `json:"emailVerified" bson:"emailVerified"`
	Image         string             `json:"image,omitempty" bson:"image,omitempty"`
	CreatedAt     time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt     time.Time          `json:"updatedAt" bson:"updatedAt"`
	// from DBUser
	IsActive          bool                `json:"isActive" bson:"isActive"`
	CurrentRide       *string             `json:"currentRide,omitempty" json:"currentRide,omitempty"`
	PushSubscriptions []*PushSubscription `json:"pushSubscriptions,omitempty" bson:"pushSubscriptions,omitempty"`
}

func MergeUser(auth *BetterAuthUser, db *DBUsers) *User {
	var currentRide string

	if db.CurrentRide != nil {
		currentRide = *db.CurrentRide
	}

	return &User{
		ID:                auth.ID,
		Name:              auth.Name,
		Email:             auth.Email,
		EmailVerified:     auth.EmailVerified,
		Image:             auth.Image,
		CreatedAt:         auth.CreatedAt,
		UpdatedAt:         auth.UpdatedAt,
		IsActive:          db.IsActive,
		CurrentRide:       &currentRide,
		PushSubscriptions: db.PushSubscriptions,
	}
}