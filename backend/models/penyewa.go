package models

import (
	"time"

	"gorm.io/gorm"
)

type Penyewa struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	Nama         string         `json:"nama" gorm:"not null"`
	Email        *string        `json:"email"`
	NoHP         *string        `json:"no_hp"`
	Alamat       *string        `json:"alamat"`
	KamarID      uint           `json:"kamar_id" gorm:"not null"`
	TanggalMasuk *time.Time     `json:"tanggal_masuk"`
	Kamar        *Kamar         `gorm:"foreignKey:KamarID"`
}
