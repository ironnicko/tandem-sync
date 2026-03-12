package utils

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var (
	jwtKey        []byte
)

func InitJWT(secret string) {
	jwtKey = []byte(secret)
}

type TokenPair struct {
	AccessToken string `json:"accessToken"`
}

func ValidateToken(c *gin.Context, tokenString string) error {
	secret := jwtKey

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return secret, nil
	})
	if err != nil {
		return err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userMap, ok := claims["user"].(map[string]interface{})
		if !ok {
			return errors.New("invalid user claims")
		}
		userID, ok := userMap["id"].(string)
		if !ok {
			return errors.New("invalid user id")
		}
		c.Set("userId", userID)
		return nil
	}
	return errors.New("invalid token claims")
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader, err := c.Cookie("better-auth.session_data")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		err = ValidateToken(c, authHeader)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired access token"})
			c.Abort()
			return
		}

		c.Next()
	}
}
