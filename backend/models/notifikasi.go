package models

import (
	"time"

	"gorm.io/gorm"
)

type Notifikasi struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	PenyewaID uint           `json:"penyewa_id" gorm:"not null"`
	Penyewa   Penyewa        `gorm:"foreignKey:PenyewaID"`
	TagihanID uint           `json:"tagihan_id" gorm:"not null"`
	Tagihan   Tagihan        `gorm:"foreignKey:TagihanID"`
	Tipe      string         `json:"tipe" gorm:"not null"`            // "H-7", "H-3", "H-1", "OVERDUE"
	Status    string         `json:"status" gorm:"default:'pending'"` // pending, sent, read
	Message   string         `json:"message" gorm:"type:text"`
	SentAt    *time.Time     `json:"sent_at"`
}

type NotifikasiResponse struct {
	ID          uint       `json:"id"`
	PenyewaID   uint       `json:"penyewa_id"`
	PenyewaNama string     `json:"penyewa_nama"`
	TagihanID   uint       `json:"tagihan_id"`
	Tipe        string     `json:"tipe"`
	Status      string     `json:"status"`
	Message     string     `json:"message"`
	SentAt      *time.Time `json:"sent_at"`
	Bulan       string     `json:"bulan"`
	Jumlah      int        `json:"jumlah"`
	CreatedAt   time.Time  `json:"created_at"`
}

type DueTagihanSummary struct {
	TotalJatuhTempo       int `json:"total_jatuh_tempo"` // H-7
	TotalMendesak         int `json:"total_mendesak"`    // H-3
	TotalKritis           int `json:"total_kritis"`      // H-1
	TotalTertunggak       int `json:"total_tertunggak"`  // OVERDUE
	JumlahTotalDue        int `json:"jumlah_total_due"`  // Total rupiah yang jatuh tempo
	JumlahTotalMendesak   int `json:"jumlah_total_mendesak"`
	JumlahTotalKritis     int `json:"jumlah_total_kritis"`
	JumlahTotalTertunggak int `json:"jumlah_total_tertunggak"`
}
