package config

import (
	"os"
)

type Config struct {
	MongoURI           string
	KafkaBrokers       string
	JWTSecret          string
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
	Mode               string
	ServerPort         string
	FrontendURL        string
	VAPIDPublickey     string
	VAPIDPrivatekey    string
	MyEmail            string
}

var Envs *Config

func LoadConfig() {
	Envs = &Config{
		MongoURI:           getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		JWTSecret:          getEnv("JWT_SECRET", "supersecret"),
		GoogleClientID:     getEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", ""),
		ServerPort:         getEnv("SERVER_PORT", "8000"),
		FrontendURL:        getEnv("FRONTEND_URL", ""),
		Mode:               getEnv("MODE", "local"),
		MyEmail:            getEnv("MY_EMAIL", ""),
		VAPIDPublickey:     getEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", ""),
		VAPIDPrivatekey:    getEnv("VAPID_PRIVATE_KEY", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
