package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	MongoURI      string
	DBName        string
	RedisURL      string
	RedisAddr     string
	RedisPassword string
	JWTSecret     string
	FrontendURL   string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not found or failed to load, reading from environment variables")
	}

	mongoURI := getEnv("MONGO_URI", "")
	if mongoURI == "" {
		mongoURI = getEnv("MONGO_URL", "")
	}
	if mongoURI == "" {
		mongoURI = getEnv("MONGODB_URL", "mongodb://127.0.0.1:27017")
	}

	redisURL := getEnv("REDIS_URL", "")
	if redisURL == "" {
		redisURL = getEnv("REDIS_PRIVATE_URL", "")
	}

	return &Config{
		Port:          getEnv("PORT", "8080"),
		MongoURI:      mongoURI,
		DBName:        getEnv("DB_NAME", "pollquiz"),
		RedisURL:      redisURL,
		RedisAddr:     getEnv("REDIS_ADDR", "127.0.0.1:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		JWTSecret:     getEnv("JWT_SECRET", "super-secret-pollquiz-jwt-key-2026"),
		FrontendURL:   getEnv("FRONTEND_URL", "https://poll-quiz.vercel.app"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
