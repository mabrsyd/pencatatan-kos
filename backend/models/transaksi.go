package models

import (
	"time"

	"gorm.io/gorm"
)

type Transaksi struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	Jenis     string         `json:"jenis" gorm:"not null"` // pemasukan, pengeluaran
	Kategori  string         `json:"kategori" gorm:"not null"`
	Jumlah    int            `json:"jumlah" gorm:"not null"`
	Tanggal   time.Time      `json:"tanggal" gorm:"not null"`
}
