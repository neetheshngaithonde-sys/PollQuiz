package routes

import (
	"net/http"

	"poll-quiz-backend/config"
	"poll-quiz-backend/handlers"
	"poll-quiz-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(
	cfg *config.Config,
	authHandler *handlers.AuthHandler,
	pollHandler *handlers.PollHandler,
	voteHandler *handlers.VoteHandler,
	wsHandler *handlers.WebSocketHandler,
) *gin.Engine {
	r := gin.Default()

	// Global Middlewares
	r.Use(middleware.CORSMiddleware(cfg.FrontendURL))
	r.Use(gin.Recovery())

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "Poll Quiz API",
			"uptime":  "running",
		})
	})

	// Real-time WebSocket Route
	r.GET("/ws/polls/:id", wsHandler.HandlePollWebSocket)

	api := r.Group("/api")
	{
		// Authentication Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(cfg.JWTSecret), authHandler.GetMe)
			auth.PUT("/change-password", middleware.AuthMiddleware(cfg.JWTSecret), authHandler.ChangePassword)
		}

		// Poll Routes
		polls := api.Group("/polls")
		{
			// Public Routes
			polls.GET("/:id", pollHandler.GetPoll)
			polls.GET("/:id/results", pollHandler.GetPollResults)
			polls.POST("/:id/vote", voteHandler.SubmitVote)

			// Protected Routes (Authentication Required)
			protected := polls.Group("")
			protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			{
				protected.POST("", pollHandler.CreatePoll)
				protected.GET("/my", pollHandler.GetUserPolls)
				protected.PATCH("/:id/status", pollHandler.TogglePollStatus)
				protected.DELETE("/:id", pollHandler.DeletePoll)
			}
		}
	}

	return r
}
