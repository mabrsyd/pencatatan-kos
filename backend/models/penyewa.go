package models

import (
	"time"

	"gorm.io/gorm"
)

type Penyewa struct {
	gorm.Model
	Nama         string     `json:"nama" gorm:"not null"`
	Email        *string    `json:"email"`
	NoHP         *string    `json:"no_hp"`
	Alamat       *string    `json:"alamat"`	
	KamarID      uint       `json:"kamar_id" gorm:"not null"`
	TanggalMasuk *time.Time `json:"tanggal_masuk"`
}
