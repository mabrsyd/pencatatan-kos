package main

import (
	"log"
	"os"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to database
	database.Connect()

	// Initialize Gin router
	r := gin.Default()

	// Setup routes
	routes.SetupRoutes(r)

	// Get port from env or default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	r.Run(":" + port)
}
