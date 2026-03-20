package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	config "github.com/ironnicko/tandem-sync/Backend/config"
	"github.com/ironnicko/tandem-sync/Backend/db"
	"github.com/ironnicko/tandem-sync/Backend/routes"
	"github.com/ironnicko/tandem-sync/Backend/utils"
	"github.com/joho/godotenv"
)

func main() {
	config.LoadConfig()
	cfg := config.Envs
	if cfg.Mode != "Prod" {
		godotenv.Load(".env.local")
		config.LoadConfig()
		cfg = config.Envs
	}

	db.Connect()
	db.ConnectRedis()
	utils.InitJWT(cfg.JWTSecret)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routes.InitializeRoutes(r)

	r.Run(":" + cfg.ServerPort)

}
