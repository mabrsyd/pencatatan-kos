package models

import (
	"time"

	"gorm.io/gorm"
)

type Pengeluaran struct {
	gorm.Model
	Kategori   string    `json:"kategori" gorm:"not null"`
	Jumlah     int       `json:"jumlah" gorm:"not null"`
	Keterangan string    `json:"keterangan"`
	Tanggal    time.Time `json:"tanggal" gorm:"not null"`
}
