package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
	"github.com/ironnicko/tandem-sync/SocketServer/config"
	"github.com/ironnicko/tandem-sync/SocketServer/types"
	"github.com/ironnicko/tandem-sync/SocketServer/utils"
)

func handleJoinRide(conn *websocket.Conn, userID string, payload types.Payload) {
	rideCode := payload.RideCode
	log.Printf("%s joining ride %s", userID, rideCode)

	if err := utils.AddParticipant(rideCode, userID); err != nil {
		conn.WriteJSON(map[string]any{"error": "Redis error"})
		return
	}

	config.RoomsMu.Lock()
	if config.RideRooms[rideCode] == nil {
		config.RideRooms[rideCode] = make(map[*websocket.Conn]string)
	}
	config.RideRooms[rideCode][conn] = userID
	config.RoomsMu.Unlock()

	allLocations, _ := config.RedisClient.HGetAll(config.CTX, fmt.Sprintf("ride:%s:locations", rideCode)).Result()
	conn.WriteJSON(map[string]any{
		"eventType": "updateLocations",
		"data": map[string]any{
			"rideCode":  rideCode,
			"locations": allLocations,
		},
	})

	utils.BroadcastToRoom(conn, rideCode, map[string]any{
		"eventType": "userJoined",
		"data":      map[string]string{"userId": userID},
	})
}

func handleLeaveRide(conn *websocket.Conn, userID string, payload types.Payload) {
	rideCode := payload.RideCode
	log.Printf("%s leaving ride %s", userID, rideCode)

	utils.RemoveParticipant(rideCode, userID)

	config.RoomsMu.Lock()
	delete(config.RideRooms[rideCode], conn)
	config.RoomsMu.Unlock()

	utils.BroadcastToRoom(conn, rideCode, map[string]any{
		"eventType": "userLeft",
		"data":      map[string]string{"userId": userID},
	})
}

func handleSendLocation(conn *websocket.Conn, userID string, payload types.Payload) {
	rideCode := payload.RideCode
	location := payload.Location
	key := fmt.Sprintf("ride:%s:locations", rideCode)
	rideSetKey := fmt.Sprintf("ride:%s", rideCode)
	// log.Printf("%s Sending Location to %s", userID, rideCode)

	locBytes, err := json.Marshal(location)
	if err != nil {
		conn.WriteJSON(map[string]any{"error": "failed to marshal location"})
		return
	}

	pipe := config.RedisClient.TxPipeline()

	pipe.HSet(config.CTX, key, userID, locBytes)

	pipe.Expire(config.CTX, rideSetKey, 30*time.Second)

	pipe.Do(config.CTX, "HEXPIRE", key, 15, "FIELDS", 1, userID)

	_, err = pipe.Exec(config.CTX)
	if err != nil {
		conn.WriteJSON(map[string]any{"error": err.Error()})
		return
	}

	allLocationsRaw, _ := config.RedisClient.HGetAll(config.CTX, key).Result()
	allLocations := make(map[string]types.GeoLocation)
	for uid, raw := range allLocationsRaw {
		var loc types.GeoLocation
		if err := json.Unmarshal([]byte(raw), &loc); err != nil {
			continue
		}
		allLocations[uid] = loc
	}

	conn.WriteJSON(map[string]any{
		"eventType": "updateLocations",
		"data": map[string]any{
			"rideCode":  rideCode,
			"locations": allLocations,
		},
	})
}

func handleSendSignal(conn *websocket.Conn, userID string, payload types.Payload) {
	log.Printf("%s Sending Signal to %s", userID, payload.RideCode)
	utils.BroadcastToRoom(conn, payload.RideCode, map[string]any{
		"eventType": "sentSignal",
		"data": map[string]any{
			"signalType": payload.SignalType,
			"location":   payload.Location,
			"userId":     userID,
		},
	})
}
