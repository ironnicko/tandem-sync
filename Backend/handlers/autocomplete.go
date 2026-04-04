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

type AutocompleteRequest struct {
	Input string `json:"input"`
}

type AutocompleteSuggestion struct {
	PlaceID   string `json:"placeId"`
	MainText  string `json:"mainText"`
	Secondary string `json:"secondaryText"`
}

func AutocompleteHandler(c *gin.Context) {
	var req AutocompleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	cacheKey := fmt.Sprintf("autocomplete:%s", req.Input)

	if cached, err := db.RedisClient.Get(c, cacheKey).Result(); err == nil {
		var suggestions []AutocompleteSuggestion
		if json.Unmarshal([]byte(cached), &suggestions) == nil {
			c.JSON(http.StatusOK, suggestions)
			return
		}
	}

	var googleResp map[string]interface{}
	resp, err := config.RestyClient.R().
		SetHeader("Content-Type", "application/json").
		SetHeader("X-Goog-Api-Key", config.Envs.GoogleMapsAPIKey).
		SetBody(map[string]interface{}{
			"input": req.Input,
		}).
		SetResult(&googleResp).
		Post("https://places.googleapis.com/v1/places:autocomplete")

	if err != nil || resp.StatusCode() != 200 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "autocomplete fetch failed"})
		return
	}

	suggestionsRaw, ok := googleResp["suggestions"].([]interface{})
	if !ok {
		c.JSON(http.StatusOK, []AutocompleteSuggestion{})
		return
	}

	var suggestions []AutocompleteSuggestion
	for _, s := range suggestionsRaw {
		suggestion := s.(map[string]interface{})["placePrediction"].(map[string]interface{})

		mainText := ""
		if mt, ok := suggestion["text"].(map[string]interface{}); ok {
			mainText = mt["text"].(string)
		}

		secondaryText := ""
		if st, ok := suggestion["secondaryText"].(map[string]interface{}); ok {
			secondaryText = st["text"].(string)
		}

		suggestions = append(suggestions, AutocompleteSuggestion{
			PlaceID:   suggestion["placeId"].(string),
			MainText:  mainText,
			Secondary: secondaryText,
		})
	}

	if data, err := json.Marshal(suggestions); err == nil {
		db.RedisClient.Set(c, cacheKey, data, 600*time.Minute)
	}

	c.JSON(http.StatusOK, suggestions)
}