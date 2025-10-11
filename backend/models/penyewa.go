package models

import (
	"time"

	"gorm.io/gorm"
)

type Penyewa struct {
	gorm.Model
	Nama         string    `json:"nama" gorm:"not null"`
	Kontak       string    `json:"kontak" gorm:"not null"`
	KamarID      uint      `json:"kamar_id" gorm:"not null"`
	TanggalMasuk time.Time `json:"tanggal_masuk" gorm:"not null"`
}
