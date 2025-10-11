package models

import (
	"time"

	"gorm.io/gorm"
)

type Transaksi struct {
	gorm.Model
	Jenis    string    `json:"jenis" gorm:"not null"` // pemasukan, pengeluaran
	Kategori string    `json:"kategori" gorm:"not null"`
	Jumlah   int       `json:"jumlah" gorm:"not null"`
	Tanggal  time.Time `json:"tanggal" gorm:"not null"`
}
