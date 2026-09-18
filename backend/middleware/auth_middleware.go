package middleware

import (
	"strings"

	"poll-quiz-backend/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.JSONUnauthorized(c, "Authorization header is required")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && strings.ToLower(parts[0]) == "bearer") {
			utils.JSONUnauthorized(c, "Authorization header format must be Bearer {token}")
			c.Abort()
			return
		}

		claims, err := utils.ValidateJWT(parts[1], jwtSecret)
		if err != nil {
			utils.JSONUnauthorized(c, "Invalid or expired token: "+err.Error())
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Next()
	}
}
