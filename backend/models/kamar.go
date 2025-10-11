package models

import (
	"gorm.io/gorm"
)

type Kamar struct {
	gorm.Model
	Nama      string  `json:"nama" gorm:"not null"`
	Harga     int     `json:"harga" gorm:"not null"`
	Status    string  `json:"status" gorm:"not null"` // Tersedia, Terisi, Perbaikan
	PenyewaID *uint   `json:"penyewa_id"`
	Penyewa   Penyewa `gorm:"foreignKey:PenyewaID"`
}
