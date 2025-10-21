package main

import (
	"log"
	"os"
	"time"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// ✅ Load environment variables dari .env
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found — using system environment variables")
	}

	// ✅ Koneksi ke database
	database.Connect()

	// ✅ Gunakan mode release di production
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// ✅ Inisialisasi router (sudah termasuk Logger dan Recovery)
	r := gin.Default()

	// ✅ Konfigurasi CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:9000", "http://localhost:9001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ⚠️ Atur trusted proxies (biar warning "not safe" hilang)
	// Kalau backend hanya dijalankan di lokal, gunakan 127.0.0.1
	if err := r.SetTrustedProxies([]string{"127.0.0.1"}); err != nil {
		log.Fatalf("Failed to set trusted proxies: %v", err)
	}

	// ✅ Setup semua route
	routes.SetupRoutes(r)

	// ✅ Gunakan port dari .env, atau fallback ke 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on http://localhost:%s", port)

	// ✅ Jalankan server
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
