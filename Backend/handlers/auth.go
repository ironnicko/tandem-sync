package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Authenticated(c *gin.Context) {
	userIDHex := c.Value("userId").(string)
	c.JSON(http.StatusOK, gin.H{
		"id": userIDHex,
	})

}
