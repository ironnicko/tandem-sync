package db

import (
	"fmt"

	"github.com/go-redis/redis/v8"
	"github.com/ironnicko/tandem-sync/Backend/config"
)

var RedisClient *redis.Client

func ConnectRedis() *redis.Client {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", config.Envs.RedisHost, config.Envs.RedisPort),
		Username: config.Envs.RedisUsername,
		Password: config.Envs.RedisPassword,
	})

	return RedisClient
}
