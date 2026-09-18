package main

import (
	"log"

	"poll-quiz-backend/config"
	"poll-quiz-backend/handlers"
	"poll-quiz-backend/repository"
	"poll-quiz-backend/routes"
	"poll-quiz-backend/services"
)

func main() {
	log.Println("Starting Poll Quiz Backend Service...")

	// 1. Load Configurations
	cfg := config.LoadConfig()

	// 2. Connect to MongoDB
	db, err := config.ConnectMongoDB(cfg)
	if err != nil {
		log.Fatalf("Fatal: MongoDB connection failed: %v", err)
	}

	// 3. Connect to Redis
	redisClient, err := config.ConnectRedis(cfg)
	if err != nil {
		log.Fatalf("Fatal: Redis connection failed: %v", err)
	}

	// 4. Initialize Repositories
	userRepo := repository.NewUserRepository(db)
	pollRepo := repository.NewPollRepository(db)
	voteRepo := repository.NewVoteRepository(db)

	// 5. Initialize Realtime Hub (Redis Pub/Sub + WebSockets)
	realtimeHub := services.NewRealtimeHub(redisClient)
	go realtimeHub.Run()

	// 6. Initialize Services
	authService := services.NewAuthService(userRepo, cfg)
	pollService := services.NewPollService(pollRepo, voteRepo)
	voteService := services.NewVoteService(pollRepo, voteRepo, realtimeHub)

	// 7. Initialize Handlers
	authHandler := handlers.NewAuthHandler(authService)
	pollHandler := handlers.NewPollHandler(pollService)
	voteHandler := handlers.NewVoteHandler(voteService)
	wsHandler := handlers.NewWebSocketHandler(realtimeHub, pollService)

	// 8. Setup Routes and Middleware
	router := routes.SetupRouter(cfg, authHandler, pollHandler, voteHandler, wsHandler)

	// 9. Run HTTP & WebSocket Server
	serverAddr := ":" + cfg.Port
	log.Printf("Poll Quiz server running on http://localhost%s", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
	}
}
