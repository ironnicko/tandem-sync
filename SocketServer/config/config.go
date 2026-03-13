package config

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"sync"

	"github.com/gorilla/websocket"

	"github.com/redis/go-redis/v9"
)

var (
	CTX         context.Context
	Upgrader    websocket.Upgrader
	RedisClient *redis.Client

	RideRooms   = make(map[string]map[*websocket.Conn]string)
	RoomsMu     sync.RWMutex
	ActiveUsers = make(map[*websocket.Conn]string)
	ActiveUsersMu sync.RWMutex
	Envs        *Config
)

type Config struct {
	JWTSECRET     string
	REDISHOST     string
	REDISPORT     string
	REDISUSERNAME string
	REDISPASSWORD string
	MODE          string
	SOCKETPORT    string
	FRONTENDURL   string
}

func LoadConfig() {
	Envs = &Config{
		JWTSECRET:     getEnv("JWT_SECRET", "supersecret"),
		REDISHOST:     getEnv("REDIS_HOST", "redis"),
		REDISPORT:     getEnv("REDIS_PORT", "6379"),
		REDISUSERNAME: getEnv("REDIS_USERNAME", ""),
		REDISPASSWORD: getEnv("REDIS_PASSWORD", ""),
		MODE:          getEnv("MODE", "local"),
		SOCKETPORT:    getEnv("SOCKET_PORT", "3001"),
		FRONTENDURL:   getEnv("FRONTEND_URL", "http://localhost:3000"),
	}
}

func LoadGlobals() {
	CTX = context.Background()
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", Envs.REDISHOST, Envs.REDISPORT),
		Username: Envs.REDISUSERNAME,
		Password: Envs.REDISPASSWORD,
	})

	Upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			if origin == "" {
				return true // allow requests without Origin header (same-origin)
			}
			u, err := url.Parse(origin)
			if err != nil {
				return false
			}
			frontendURL, err := url.Parse(Envs.FRONTENDURL)
			if err != nil {
				return false
			}
			return u.Host == frontendURL.Host
		},
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
