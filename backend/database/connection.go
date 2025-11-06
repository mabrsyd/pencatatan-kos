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
		dsn = "host=localhost user=postgres password=postgres dbname=kos_muhandis port=5432 sslmode=disable"
	}

	log.Println("Connecting to database with DSN:", dsn)

	// First try to connect to postgres database to create our database
	dbName := "kos_muhandis"
	createDBDSN := "host=localhost user=postgres password=postgres dbname=postgres port=5432 sslmode=disable"

	tempDB, err := gorm.Open(postgres.Open(createDBDSN), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to postgres database:", err)
	}

	// Check if our database exists
	var exists bool
	tempDB.Raw("SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = ?)", dbName).Scan(&exists)

	if !exists {
		log.Printf("Database '%s' does not exist, creating...", dbName)
		err = tempDB.Exec("CREATE DATABASE " + dbName).Error
		if err != nil {
			log.Fatal("Failed to create database:", err)
		}
		log.Printf("Database '%s' created successfully", dbName)
	}

	sqlDB, _ := tempDB.DB()
	sqlDB.Close()

	// Now connect to our database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Test the connection
	sqlDB, err = DB.DB()
	if err != nil {
		log.Fatal("Failed to get underlying SQL DB:", err)
	}

	err = sqlDB.Ping()
	if err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("Database connection successful")

	// Handle transaksi table migration - drop and recreate if needed
	if DB.Migrator().HasTable(&models.Transaksi{}) {
		// Check if old tagihan_id column exists
		if DB.Migrator().HasColumn(&models.Transaksi{}, "tagihan_id") {
			log.Println("Old transaksi table structure detected, recreating table...")
			err = DB.Migrator().DropTable(&models.Transaksi{})
			if err != nil {
				log.Fatal("Failed to drop old transaksi table:", err)
			}
			log.Println("Dropped old transaksi table")
		}
	}

	// Manual table creation instead of AutoMigrate
	log.Println("Starting database migration...")

	// Create tables manually
	err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP NULL,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			role VARCHAR(255) NOT NULL
		)
	`).Error
	if err != nil {
		log.Fatal("Failed to create users table:", err)
	}

	err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS kamars (
			id SERIAL PRIMARY KEY,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP NULL,
			nama VARCHAR(255) NOT NULL,
			harga INTEGER NOT NULL,
			status VARCHAR(255) NOT NULL
		)
	`).Error
	if err != nil {
		log.Fatal("Failed to create kamars table:", err)
	}

	err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS penyewas (
			id SERIAL PRIMARY KEY,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP NULL,
			nama VARCHAR(255) NOT NULL,
			email VARCHAR(255) NULL,
			no_hp VARCHAR(255) NULL,
			alamat TEXT NULL,
			kamar_id INTEGER NOT NULL,
			tanggal_masuk DATE NULL
		)
	`).Error
	if err != nil {
		log.Fatal("Failed to create penyewas table:", err)
	}

	err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS tagihans (
			id SERIAL PRIMARY KEY,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP NULL,
			penyewa_id INTEGER NOT NULL,
			kamar_id INTEGER NOT NULL,
			bulan VARCHAR(255) NOT NULL,
			jumlah INTEGER NOT NULL,
			terbayar INTEGER DEFAULT 0,
			status VARCHAR(255) NOT NULL,
			jenis_tagihan VARCHAR(255) DEFAULT 'Penyewa',
			diterima_oleh VARCHAR(255) NULL,
			tanggal_bayar DATE NULL
		)
	`).Error
	if err != nil {
		log.Fatal("Failed to create tagihans table:", err)
	}

	err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS transaksis (
			id SERIAL PRIMARY KEY,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP NULL,
			jenis VARCHAR(255) NOT NULL,
			kategori VARCHAR(255) NOT NULL,
			jumlah INTEGER NOT NULL,
			tanggal DATE NOT NULL
		)
	`).Error
	if err != nil {
		log.Fatal("Failed to create transaksis table:", err)
	}

	err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS notifikasis (
			id SERIAL PRIMARY KEY,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP NULL,
			penyewa_id INTEGER NOT NULL,
			tagihan_id INTEGER NOT NULL,
			tipe VARCHAR(255) NOT NULL,
			status VARCHAR(255) DEFAULT 'pending',
			message TEXT NULL,
			sent_at TIMESTAMP NULL
		)
	`).Error
	if err != nil {
		log.Fatal("Failed to create notifikasis table:", err)
	}

	log.Println("Database connected and migrated successfully")
}
