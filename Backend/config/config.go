package config

import (
	"os"
	"time"

	"github.com/go-resty/resty/v2"
)

type Config struct {
	MongoURI         string
	KafkaBrokers     string
	JWTSecret        string
	Mode             string
	RedisHost        string
	RedisPort        string
	RedisUsername    string
	RedisPassword    string
	ServerPort       string
	FrontendURL      string
	VAPIDPublickey   string
	VAPIDPrivatekey  string
	GoogleMapsAPIKey string
	MyEmail          string
}

var Envs *Config
var RestyClient *resty.Client

func LoadConfig() {
	RestyClient = resty.New().
		SetTimeout(5 * time.Second).
		SetRetryCount(2).
		SetRetryWaitTime(500 * time.Millisecond)
	Envs = &Config{
		MongoURI:         getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		JWTSecret:        getEnv("JWT_SECRET", "supersecret"),
		ServerPort:       getEnv("SERVER_PORT", "8000"),
		FrontendURL:      getEnv("FRONTEND_URL", ""),
		Mode:             getEnv("MODE", "local"),
		MyEmail:          getEnv("MY_EMAIL", ""),
		VAPIDPublickey:   getEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", ""),
		VAPIDPrivatekey:  getEnv("VAPID_PRIVATE_KEY", ""),
		RedisHost:        getEnv("REDIS_HOST", ""),
		RedisPort:        getEnv("REDIS_PORT", ""),
		RedisUsername:    getEnv("REDIS_USERNAME", ""),
		RedisPassword:    getEnv("REDIS_PASSWORD", ""),
		GoogleMapsAPIKey: getEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
