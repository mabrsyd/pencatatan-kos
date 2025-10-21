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
	if err := database.DB.Preload("Penyewa").Preload("Kamar").Find(&tagihan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tagihan"})
		return
	}
	c.JSON(http.StatusOK, tagihan)
}

func GetTagihanByPenyewa(c *gin.Context) {
	penyewaID := c.Param("id")
	tahun := c.Query("tahun")

	var tagihan []models.Tagihan
	query := database.DB.Preload("Penyewa").Preload("Kamar").Where("penyewa_id = ?", penyewaID)

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
	query := database.DB.Preload("Penyewa").Preload("Kamar")

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
		KamarID      uint   `json:"kamar_id" binding:"required"`
		Bulan        string `json:"bulan" binding:"required"`
		Jumlah       int    `json:"jumlah" binding:"required"`
		Status       string `json:"status" binding:"required"`
		JenisTagihan string `json:"jenis_tagihan"`
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
	if input.KamarID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "KamarID is required and cannot be zero"})
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

	jenisTagihan := "Penyewa"
	if input.JenisTagihan != "" {
		jenisTagihan = input.JenisTagihan
	}

	tagihan := models.Tagihan{
		PenyewaID:    input.PenyewaID,
		KamarID:      input.KamarID,
		Bulan:        input.Bulan,
		Jumlah:       input.Jumlah,
		Status:       input.Status,
		JenisTagihan: jenisTagihan,
	}
	if err := database.DB.Create(&tagihan).Error; err != nil {
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
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Status != "" {
		tagihan.Status = input.Status
	}
	if input.Terbayar > 0 {
		tagihan.Terbayar = input.Terbayar
		// Auto-update status based on payment
		if input.Terbayar >= tagihan.Jumlah {
			tagihan.Status = "Lunas"
		} else if input.Terbayar > 0 {
			tagihan.Status = "Cicil"
		}
	}
	if input.JenisTagihan != "" {
		tagihan.JenisTagihan = input.JenisTagihan
	}
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
