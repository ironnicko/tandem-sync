package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ironnicko/tandem-sync/Backend/config"
	"github.com/ironnicko/tandem-sync/Backend/db"
)

type PlaceDetailsRequest struct {
	PlaceID string `json:"placeId"`
}

type PlaceDetailsResponse struct {
	Lat              float64 `json:"lat"`
	Lng              float64 `json:"lng"`
	Name             string  `json:"name"`
	FormattedAddress string  `json:"formattedAddress"`
}

func PlaceDetailsHandler(c *gin.Context) {
	var req PlaceDetailsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	cacheKey := fmt.Sprintf("place-details:%s", req.PlaceID)

	if cached, err := db.RedisClient.Get(c, cacheKey).Result(); err == nil {
		var details PlaceDetailsResponse
		if json.Unmarshal([]byte(cached), &details) == nil {
			c.JSON(http.StatusOK, details)
			return
		}
	}

	var googleResp map[string]interface{}
	resp, err := config.RestyClient.R().
		SetHeader("Content-Type", "application/json").
		SetHeader("X-Goog-Api-Key", config.Envs.GoogleMapsAPIKey).
		SetHeader("X-Goog-FieldMask", "id,name,formattedAddress,location,displayName").
		SetResult(&googleResp).
		Get(fmt.Sprintf("https://places.googleapis.com/v1/places/%s", req.PlaceID))

	if err != nil || resp.StatusCode() != 200 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "place details fetch failed"})
		return
	}

	location := googleResp["location"].(map[string]interface{})
	displayName := googleResp["displayName"].(map[string]interface{})["text"].(string)

	result := PlaceDetailsResponse{
		Lat:              location["latitude"].(float64),
		Lng:              location["longitude"].(float64),
		Name:             displayName,
		FormattedAddress: googleResp["formattedAddress"].(string),
	}

	if data, err := json.Marshal(result); err == nil {
		db.RedisClient.Set(c, cacheKey, data, 600*time.Minute)
	}

	c.JSON(http.StatusOK, result)
}
