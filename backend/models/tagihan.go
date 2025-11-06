package models

import (
	"time"

	"gorm.io/gorm"
)

type Tagihan struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	PenyewaID    uint           `json:"penyewa_id" gorm:"not null"`
	Penyewa      Penyewa        `gorm:"foreignKey:PenyewaID"`
	KamarID      uint           `json:"kamar_id" gorm:"not null"`
	Kamar        Kamar          `gorm:"foreignKey:KamarID"`
	Bulan        string         `json:"bulan" gorm:"not null"` // e.g., "2023-10"
	Jumlah       int            `json:"jumlah" gorm:"not null"`
	Terbayar     int            `json:"terbayar" gorm:"default:0"`              // Jumlah yang sudah dibayar (untuk cicilan)
	Status       string         `json:"status" gorm:"not null"`                 // Lunas, Belum Lunas, Cicil
	JenisTagihan string         `json:"jenis_tagihan" gorm:"default:'Penyewa'"` // Penyewa, Listrik, WiFi, Air, dll
	DiterimaOleh string         `json:"diterima_oleh,omitempty"`                // Siapa yang menerima pembayaran
	TanggalBayar string         `json:"tanggal_bayar,omitempty"`                // Tanggal pembayaran diterima
}
