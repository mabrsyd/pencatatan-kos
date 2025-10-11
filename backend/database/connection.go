package database

import (
	"log"
	"os"

	"kos-muhandis/backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=password dbname=kos_muhandis port=5432 sslmode=disable"
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate
	err = DB.AutoMigrate(&models.User{}, &models.Kamar{}, &models.Penyewa{}, &models.Tagihan{}, &models.Transaksi{}, &models.Pengeluaran{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database connected and migrated successfully")
}
