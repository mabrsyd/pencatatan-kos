package models

import (
	"gorm.io/gorm"
)

type Tagihan struct {
	gorm.Model
	PenyewaID uint    `json:"penyewa_id" gorm:"not null"`
	Penyewa   Penyewa `gorm:"foreignKey:PenyewaID"`
	KamarID   uint    `json:"kamar_id" gorm:"not null"`
	Kamar     Kamar   `gorm:"foreignKey:KamarID"`
	Bulan     string  `json:"bulan" gorm:"not null"` // e.g., "2023-10"
	Jumlah    int     `json:"jumlah" gorm:"not null"`
	Status    string  `json:"status" gorm:"not null"` // Lunas, Belum Lunas
}
