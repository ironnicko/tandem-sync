package main

import (
	"log"
	"net/http"

	"github.com/ironnicko/tandem-sync/SocketServer/config"
	"github.com/ironnicko/tandem-sync/SocketServer/handlers"
	"github.com/joho/godotenv"
)

func main() {

	config.LoadConfig()
	cfg := config.Envs
	if cfg.MODE != "Prod" {
		godotenv.Load(".env.local")
		config.LoadConfig()
		cfg = config.Envs
	}
	config.LoadGlobals()
	http.HandleFunc("/wss", handlers.HandleWebSocket)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	log.Println("🚀 Gorilla WebSocket server running on :" + cfg.SOCKETPORT)
	log.Fatal(http.ListenAndServe(":"+cfg.SOCKETPORT, nil))
}
