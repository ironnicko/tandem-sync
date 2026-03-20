package handlers

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ironnicko/tandem-sync/Backend/config"
	"github.com/ironnicko/tandem-sync/Backend/db"
	"github.com/ironnicko/tandem-sync/Backend/models"
)

type RouteRequest struct {
	Origin      models.GeoLocation `json:"origin"`
	Destination models.GeoLocation `json:"destination"`
}

type RouteResponse struct {
	Polyline string `json:"polyline"`
	Distance int    `json:"distance"`
	Duration string `json:"duration"`
}

func round(v float64) float64 {
	return math.Round(v*1000) / 1000
}

func key(oLat, oLng, dLat, dLng float64) string {
	return fmt.Sprintf("route:%.3f,%.3f:%.3f,%.3f", oLat, oLng, dLat, dLng)
}

// RouteHandler handles the route request by first checking the cache and then calling the Google Maps API.
// Request : { "origin": { "lat": , "lng":  }, "destination": { "lat": , "lng":  } }
// Response : { "polyline": , "distance": , "duration": }
func RouteHandler(c *gin.Context) {
	var req RouteRequest
	if c.ShouldBindJSON(&req) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	oLat, oLng := round(req.Origin.Lat), round(req.Origin.Lng)
	dLat, dLng := round(req.Destination.Lat), round(req.Destination.Lng)
	k := key(oLat, oLng, dLat, dLng)

	// 🔥 Cache hit
	if cached, err := db.RedisClient.Get(c, k).Result(); err == nil {
		var r RouteResponse
		if json.Unmarshal([]byte(cached), &r) == nil {
			c.JSON(http.StatusOK, r)
			return
		}
	}

	// 🔥 Google call
	var parsed map[string]interface{}
	resp, err := config.RestyClient.R().
		SetHeader("Content-Type", "application/json").
		SetHeader("X-Goog-Api-Key", config.Envs.GoogleMapsAPIKey).
		SetHeader("X-Goog-FieldMask", "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration").
		SetBody(map[string]interface{}{
			"origin": map[string]interface{}{
				"location": map[string]interface{}{
					"latLng": map[string]float64{"latitude": oLat, "longitude": oLng},
				},
			},
			"destination": map[string]interface{}{
				"location": map[string]interface{}{
					"latLng": map[string]float64{"latitude": dLat, "longitude": dLng},
				},
			},
			"travelMode":               "TWO_WHEELER",
			"routingPreference":        "TRAFFIC_AWARE",
			"computeAlternativeRoutes": "false",
			"languageCode":             "en-US",
			"units":                    "METRIC",
		}).
		SetResult(&parsed).
		Post("https://routes.googleapis.com/directions/v2:computeRoutes")

	if err != nil || resp.StatusCode() != 200 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "route fetch failed"})
		return
	}

	routes, ok := parsed["routes"].([]interface{})
	if !ok || len(routes) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "no route"})
		return
	}

	r := routes[0].(map[string]interface{})
	p := r["polyline"].(map[string]interface{})["encodedPolyline"].(string)

	result := RouteResponse{
		Polyline: p,
		Distance: int(r["distanceMeters"].(float64)),
		Duration: r["duration"].(string),
	}

	// 🔥 Cache
	if data, err := json.Marshal(result); err == nil {
		db.RedisClient.Set(c, k, data, 60*time.Minute)
	}

	c.JSON(http.StatusOK, result)
}
