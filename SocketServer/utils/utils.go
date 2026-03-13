package utils

import (
	"fmt"
	"log"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/ironnicko/tandem-sync/SocketServer/config"
)

func IsValidToken(authHeader string) (string, bool) {
	cfg := config.Envs

	token, err := jwt.Parse(authHeader, func(token *jwt.Token) (interface{}, error) {
		// Ensure correct signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(cfg.JWTSECRET), nil
	})

	if err != nil {
		log.Println("JWT parse error:", err)
		return "", false
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		log.Println("invalid token claims")
		return "", false
	}

	userMap, ok := claims["user"].(map[string]interface{})
	if !ok {
		log.Println("invalid user claims")
		return "", false
	}

	userID, ok := userMap["id"].(string)
	if !ok || userID == "" {
		log.Println("invalid user id")
		return "", false
	}

	return userID, true
}

func BroadcastToRoom(skipConn *websocket.Conn, rideCode string, msg any) {
	config.RoomsMu.RLock()
	conns := make([]*websocket.Conn, 0, len(config.RideRooms[rideCode]))
	for conn := range config.RideRooms[rideCode] {

		if conn == skipConn {
			continue
		}
		conns = append(conns, conn)
	}
	config.RoomsMu.RUnlock()

	for _, conn := range conns {
		if err := conn.WriteJSON(msg); err != nil {
			CleanupConnection(conn)
		}
	}
}

func CleanupConnection(conn *websocket.Conn) {
	config.ActiveUsersMu.Lock()
	userID := config.ActiveUsers[conn]
	delete(config.ActiveUsers, conn)
	config.ActiveUsersMu.Unlock()

	var ridesToNotify []string

	config.RoomsMu.Lock()
	for rideCode, members := range config.RideRooms {
		if _, ok := members[conn]; ok {
			delete(members, conn)
			ridesToNotify = append(ridesToNotify, rideCode)
		}
	}
	config.RoomsMu.Unlock()

	for _, rideCode := range ridesToNotify {
		BroadcastToRoom(conn, rideCode, map[string]any{
			"eventType": "userLeft",
			"data":      map[string]string{"userId": userID},
		})
	}

	conn.Close()
}
