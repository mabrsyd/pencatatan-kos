package models

import (
	"time"

	"gorm.io/gorm"
)

type Kamar struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	Nama      string         `json:"nama" gorm:"not null"`
	Harga     int            `json:"harga" gorm:"not null"`
	Status    string         `json:"status" gorm:"not null"`
	Penyewa   *Penyewa       `json:"penyewa" gorm:"foreignKey:KamarID;references:ID"`
}
