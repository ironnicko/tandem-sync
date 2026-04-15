package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
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

// findCachedRoute searches for a route that starts and ends near the requested coordinates using a Redis Pipeline.
func findCachedRoute(ctx context.Context, origin, dest models.GeoLocation) string {
	const threshold = 0.1 // 100 meters

	// 1. Find origins near the requested origin
	origins, err := db.RedisClient.GeoRadius(ctx, "{route}:origins", origin.Lng, origin.Lat, &redis.GeoRadiusQuery{
		Radius: threshold,
		Unit:   "km",
	}).Result()
	if err != nil || len(origins) == 0 {
		return ""
	}

	// 2. For each nearby origin, search its specific destination GEO set in a single pipeline
	pipe := db.RedisClient.Pipeline()
	cmds := make([]*redis.GeoLocationCmd, len(origins))
	for i, o := range origins {
		cmds[i] = pipe.GeoRadius(ctx, fmt.Sprintf("{route}:origin:%s:destinations", o.Name), dest.Lng, dest.Lat, &redis.GeoRadiusQuery{
			Radius: threshold,
			Unit:   "km",
		})
	}

	// Execute all queries in one network round-trip
	_, _ = pipe.Exec(ctx)

	for _, cmd := range cmds {
		destinations, err := cmd.Result()
		if err == nil && len(destinations) > 0 {
			// Found a match!
			return destinations[0].Name
		}
	}

	return ""
}

// RouteHandler handles the route request by first checking the geospatial cache and then calling the Google Maps API.
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

	// 2. Exact Redis key lookup — single GET, skips GEO search overhead
	if cached, err := db.RedisClient.Get(c, k).Result(); err == nil {
		var r RouteResponse
		if json.Unmarshal([]byte(cached), &r) == nil {
			fmt.Println("Redis Exact Hit!")
			c.JSON(http.StatusOK, r)
			return
		}
	}

	// 3. Geospatial cache — for coordinates that are close but not exactly rounded the same
	matchKey := findCachedRoute(c, req.Origin, req.Destination)
	if matchKey != "" {
		if cached, err := db.RedisClient.Get(c, matchKey).Result(); err == nil {
			var r RouteResponse
			if json.Unmarshal([]byte(cached), &r) == nil {
				fmt.Println("Redis Geo Hit!")
				c.JSON(http.StatusOK, r)
				return
			}
		}
	}

	// 4. Cache miss — call Google Routes API
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

	if data, err := json.Marshal(result); err == nil {
		db.RedisClient.Set(c, k, data, 60*time.Minute)

		// Check if we already have an origin indexed near this origin to reuse bucket
		nearOrigins, _ := db.RedisClient.GeoRadius(c, "{route}:origins", req.Origin.Lng, req.Origin.Lat, &redis.GeoRadiusQuery{
			Radius: 0.1,
			Unit:   "km",
		}).Result()

		var originID string
		if len(nearOrigins) > 0 {
			originID = nearOrigins[0].Name
		} else {
			originID = fmt.Sprintf("%.4f,%.4f", oLat, oLng)
			db.RedisClient.GeoAdd(c, "{route}:origins", &redis.GeoLocation{
				Name: originID, Longitude: req.Origin.Lng, Latitude: req.Origin.Lat,
			})
		}

		db.RedisClient.GeoAdd(c, fmt.Sprintf("{route}:origin:%s:destinations", originID), &redis.GeoLocation{
			Name: k, Longitude: req.Destination.Lng, Latitude: req.Destination.Lat,
		})
	}

	c.JSON(http.StatusOK, result)
}
