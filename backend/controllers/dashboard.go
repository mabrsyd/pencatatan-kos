package controllers

import (
	"net/http"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/models"

	"github.com/gin-gonic/gin"
)

func GetDashboard(c *gin.Context) {
	// Jumlah kamar
	var totalKamar int64
	database.DB.Model(&models.Kamar{}).Count(&totalKamar)

	// Jumlah penyewa
	var totalPenyewa int64
	database.DB.Model(&models.Penyewa{}).Count(&totalPenyewa)

	// Total pendapatan (dari tagihan lunas)
	var totalPendapatan int64
	database.DB.Model(&models.Tagihan{}).Where("status = ?", "Lunas").Select("COALESCE(SUM(jumlah), 0)").Scan(&totalPendapatan)

	// Tagihan belum dibayar
	var tagihanBelum int64
	database.DB.Model(&models.Tagihan{}).Where("status != ?", "Lunas").Count(&tagihanBelum)

	// Data untuk grafik pendapatan bulanan
	var pendapatanBulanan []map[string]interface{}
	database.DB.Model(&models.Tagihan{}).
		Where("status = ?", "Lunas").
		Select("bulan, COALESCE(SUM(jumlah), 0)::integer as total").
		Group("bulan").
		Order("bulan DESC").
		Find(&pendapatanBulanan)

	// Tingkat hunian kamar
	var tersedia int64
	database.DB.Model(&models.Kamar{}).Where("status = ?", "Tersedia").Count(&tersedia)
	var terisi int64
	database.DB.Model(&models.Kamar{}).Where("status = ?", "Terisi").Count(&terisi)
	var perbaikan int64
	database.DB.Model(&models.Kamar{}).Where("status = ?", "Perbaikan").Count(&perbaikan)

	// Transaksi terbaru
	var transaksiTerbaru []models.Transaksi
	database.DB.Order("created_at DESC").Limit(5).Find(&transaksiTerbaru)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"totalKamar":      totalKamar,
			"totalPenyewa":    totalPenyewa,
			"totalPendapatan": totalPendapatan,
			"tagihanBelum":    tagihanBelum,
		},
		"charts": gin.H{
			"pendapatanBulanan": pendapatanBulanan,
			"hunianKamar": gin.H{
				"tersedia":  tersedia,
				"terisi":    terisi,
				"perbaikan": perbaikan,
			},
		},
		"transaksiTerbaru": transaksiTerbaru,
	})
}

func GenerateMonthlyBills(c *gin.Context) {
	var input struct {
		Bulan string `json:"bulan" binding:"required"` // format: "2023-10"
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get all penyewa with their kamar
	var penyewa []models.Penyewa
	if err := database.DB.Find(&penyewa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch penyewa"})
		return
	}

	var createdBills []models.Tagihan
	var skippedBills []string

	for _, p := range penyewa {
		// Get kamar data for this penyewa
		var kamar models.Kamar
		if err := database.DB.Where("id = ?", p.KamarID).First(&kamar).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch kamar for " + p.Nama})
			return
		}

		// Check if bill already exists for this month
		var existingBill models.Tagihan
		result := database.DB.Where("penyewa_id = ? AND bulan = ?", p.ID, input.Bulan).First(&existingBill)
		if result.Error == nil {
			skippedBills = append(skippedBills, p.Nama)
			continue
		}

		// Create new bill
		bill := models.Tagihan{
			PenyewaID: p.ID,
			Bulan:     input.Bulan,
			Jumlah:    kamar.Harga,
			Status:    "Belum Lunas",
		}

		if err := database.DB.Create(&bill).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create bill for " + p.Nama})
			return
		}

		createdBills = append(createdBills, bill)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Tagihan bulanan berhasil dibuat",
		"createdBills": len(createdBills),
		"skippedBills": len(skippedBills),
		"skippedNames": skippedBills,
		"bills":        createdBills,
	})
}
