package models

import (
	"time"
)

type BetterAuthAccount struct {
	ID                    string    `json:"id" bson:"id"`
	AccountID             string    `json:"accountId" bson:"accountId"`
	ProviderID            string    `json:"providerId" bson:"providerId"` // "google", "credential"
	UserID                string    `json:"userId" bson:"userId"`
	AccessToken           string    `json:"accessToken,omitempty" bson:"accessToken,omitempty"`
	RefreshToken          string    `json:"refreshToken,omitempty" bson:"refreshToken,omitempty"`
	AccessTokenExpiresAt  time.Time `json:"accessTokenExpiresAt,omitempty" bson:"accessTokenExpiresAt,omitempty"`
	RefreshTokenExpiresAt time.Time `json:"refreshTokenExpiresAt,omitempty" bson:"refreshTokenExpiresAt,omitempty"`
	Scope                 string    `json:"scope,omitempty" bson:"scope,omitempty"`
	IDToken               string    `json:"idToken,omitempty" bson:"idToken,omitempty"`
	CreatedAt             time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt             time.Time `json:"updatedAt" bson:"updatedAt"`
}

type BetterAuthSession struct {
	ID        string    `json:"id" bson:"_id"`
	UserID    string    `json:"userId" bson:"userId"`
	Token     string    `json:"token" bson:"token"`
	IPAddress string    `json:"ipAddress,omitempty" bson:"ipAddress,omitempty"`
	UserAgent string    `json:"userAgent,omitempty" bson:"userAgent,omitempty"`
	ExpiresAt time.Time `json:"expiresAt" bson:"expiresAt"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
}
