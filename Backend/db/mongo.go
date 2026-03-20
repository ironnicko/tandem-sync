package db

import (
	"context"
	"log"
	"time"
	"github.com/ironnicko/tandem-sync/Backend/config"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client

func Connect() *mongo.Client {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(config.Envs.MongoURI))
	if err != nil {
		log.Fatalf("MongoDB connection error: %v", err)
	}

	if err = client.Ping(ctx, nil); err != nil {
		log.Fatalf("MongoDB ping failed: %v", err)
	}

	log.Println("Connected to MongoDB")
	MongoClient = client

	return client
}

func GetCollection(dbName, collName string) *mongo.Collection {
	return MongoClient.Database(dbName).Collection(collName)
}
