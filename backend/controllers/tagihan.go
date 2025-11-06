package controllers

import (
	"net/http"
	"strconv"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/models"

	"github.com/gin-gonic/gin"
)

func GetTagihan(c *gin.Context) {
	var tagihan []models.Tagihan
	if err := database.DB.Preload("Penyewa.Kamar").Find(&tagihan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tagihan"})
		return
	}
	c.JSON(http.StatusOK, tagihan)
}

func GetTagihanByPenyewa(c *gin.Context) {
	penyewaIDStr := c.Param("id")
	penyewaID, err := strconv.ParseUint(penyewaIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid penyewa ID"})
		return
	}
	tahun := c.Query("tahun")

	var tagihan []models.Tagihan
	query := database.DB.Preload("Penyewa.Kamar").Where("penyewa_id = ?", uint(penyewaID))

	if tahun != "" {
		query = query.Where("bulan LIKE ?", tahun+"-%")
	}

	if err := query.Find(&tagihan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tagihan"})
		return
	}
	c.JSON(http.StatusOK, tagihan)
}

func GetTagihanFiltered(c *gin.Context) {
	tahun := c.Query("tahun")
	bulan := c.Query("bulan")
	jenisTagihan := c.Query("jenis_tagihan")

	var tagihan []models.Tagihan
	query := database.DB.Preload("Penyewa.Kamar")

	if tahun != "" {
		query = query.Where("bulan LIKE ?", tahun+"-%")
	}
	if bulan != "" {
		query = query.Where("bulan LIKE ?", "%-"+bulan)
	}
	if jenisTagihan != "" {
		query = query.Where("jenis_tagihan = ?", jenisTagihan)
	}

	if err := query.Find(&tagihan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tagihan"})
		return
	}
	c.JSON(http.StatusOK, tagihan)
}

func CreateTagihan(c *gin.Context) {
	var input struct {
		PenyewaID    uint   `json:"penyewa_id" binding:"required"`
		Bulan        string `json:"bulan" binding:"required"`
		Jumlah       int    `json:"jumlah" binding:"required"`
		Terbayar     int    `json:"terbayar"`
		Status       string `json:"status" binding:"required"`
		JenisTagihan string `json:"jenis_tagihan"`
		DiterimaOleh string `json:"diterima_oleh"`
		TanggalBayar string `json:"tanggal_bayar"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	// Additional validation
	if input.PenyewaID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PenyewaID is required and cannot be zero"})
		return
	}
	if input.Bulan == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bulan is required"})
		return
	}
	if input.Jumlah <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jumlah must be greater than zero"})
		return
	}
	if input.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status is required"})
		return
	}

	// Get penyewa to get kamar_id
	var penyewa models.Penyewa
	if err := database.DB.First(&penyewa, input.PenyewaID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Penyewa not found"})
		return
	}

	jenisTagihan := "Penyewa"
	if input.JenisTagihan != "" {
		jenisTagihan = input.JenisTagihan
	}

	// Auto-set terbayar based on status
	terbayar := input.Terbayar
	status := input.Status
	if status == "Lunas" {
		terbayar = input.Jumlah
	} else if status == "Belum Lunas" {
		terbayar = 0
	}
	// For "Cicil", use input.Terbayar

	tagihan := models.Tagihan{
		PenyewaID:    input.PenyewaID,
		KamarID:      penyewa.KamarID,
		Bulan:        input.Bulan,
		Jumlah:       input.Jumlah,
		Terbayar:     terbayar,
		Status:       status,
		JenisTagihan: jenisTagihan,
		DiterimaOleh: input.DiterimaOleh,
		TanggalBayar: input.TanggalBayar,
	}
	if err := database.DB.Create(&tagihan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tagihan"})
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tagihan"})
		return
	}
	c.JSON(http.StatusCreated, tagihan)
}

func UpdateTagihan(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var tagihan models.Tagihan
	if err := database.DB.First(&tagihan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tagihan not found"})
		return
	}
	var input struct {
		Status       string `json:"status"`
		Terbayar     int    `json:"terbayar"`
		JenisTagihan string `json:"jenis_tagihan"`
		DiterimaOleh string `json:"diterima_oleh"`
		TanggalBayar string `json:"tanggal_bayar"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Status != "" {
		tagihan.Status = input.Status
		// Auto-set terbayar based on new status
		if input.Status == "Lunas" {
			tagihan.Terbayar = tagihan.Jumlah
		} else if input.Status == "Belum Lunas" {
			tagihan.Terbayar = 0
		}
		// For "Cicil", terbayar is set below if provided
	}
	if input.Terbayar > 0 {
		tagihan.Terbayar = input.Terbayar
		// Auto-update status based on payment if status not explicitly set
		if input.Status == "" {
			if input.Terbayar >= tagihan.Jumlah {
				tagihan.Status = "Lunas"
			} else if input.Terbayar > 0 {
				tagihan.Status = "Cicil"
			}
		}
	}
	if input.JenisTagihan != "" {
		tagihan.JenisTagihan = input.JenisTagihan
	}
	tagihan.DiterimaOleh = input.DiterimaOleh
	tagihan.TanggalBayar = input.TanggalBayar
	if err := database.DB.Save(&tagihan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tagihan"})
		return
	}
	c.JSON(http.StatusOK, tagihan)
}

func DeleteTagihan(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := database.DB.Delete(&models.Tagihan{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete tagihan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tagihan deleted"})
}

func FixTerbayarMassal(c *gin.Context) {
	var tagihanList []models.Tagihan
	if err := database.DB.Find(&tagihanList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tagihan"})
		return
	}

	updatedCount := 0
	for _, t := range tagihanList {
		needsUpdate := false
		if t.Status == "Lunas" && t.Terbayar != t.Jumlah {
			t.Terbayar = t.Jumlah
			needsUpdate = true
		} else if t.Status == "Belum Lunas" && t.Terbayar != 0 {
			t.Terbayar = 0
			needsUpdate = true
		}
		// For "Cicil", assume terbayar is already correct

		if needsUpdate {
			if err := database.DB.Save(&t).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tagihan ID " + strconv.Itoa(int(t.ID))})
				return
			}
			updatedCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Mass update completed",
		"updated": updatedCount,
		"total":   len(tagihanList),
	})
}
