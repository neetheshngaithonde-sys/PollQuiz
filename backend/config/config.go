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

	return &Config{
		Port:          getEnv("PORT", "8080"),
		MongoURI:      getEnv("MONGO_URI", "mongodb://127.0.0.1:27017"),
		DBName:        getEnv("DB_NAME", "pollquiz"),
		RedisURL:      getEnv("REDIS_URL", ""),
		RedisAddr:     getEnv("REDIS_ADDR", "127.0.0.1:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		JWTSecret:     getEnv("JWT_SECRET", "super-secret-pollquiz-jwt-key-2026"),
		FrontendURL:   getEnv("FRONTEND_URL", "http://localhost:5173"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
