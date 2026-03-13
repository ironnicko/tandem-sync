package handlers

import (
	"log"
	"net/http"

	"github.com/ironnicko/tandem-sync/SocketServer/config"
	"github.com/ironnicko/tandem-sync/SocketServer/types"
	"github.com/ironnicko/tandem-sync/SocketServer/utils"
)

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Read BetterAuth session cookie
	cookie, err := r.Cookie("better-auth.session_token")
	if err != nil {
		// fallback to session cookie
		cookie, err = r.Cookie("better-auth.session")
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
	}

	token := cookie.Value

	// Validate token / session
	userID, ok := utils.IsValidToken(token)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	conn, err := config.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}
	defer conn.Close()

	config.ActiveUsersMu.Lock()
	config.ActiveUsers[conn] = userID
	config.ActiveUsersMu.Unlock()
	log.Printf("✅ User connected: %s", userID)

	for {
		var msg types.Message

		if err := conn.ReadJSON(&msg); err != nil {
			log.Printf("❌ Disconnected %s: %v", userID, err)
			utils.CleanupConnection(conn)
			break
		}

		switch msg.EventType {

		case "joinRide":
			payload := msg.Data
			handleJoinRide(conn, userID, payload)

		case "leaveRide":
			payload := msg.Data
			handleLeaveRide(conn, userID, payload)

		case "sendLocation":
			payload := msg.Data
			handleSendLocation(conn, userID, payload)

		case "sendSignal":
			payload := msg.Data
			handleSendSignal(conn, userID, payload)
		}
	}
}
