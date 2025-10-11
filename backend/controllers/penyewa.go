package controllers

import (
	"net/http"
	"strconv"
	"time"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/models"

	"github.com/gin-gonic/gin"
)

func GetPenyewa(c *gin.Context) {
	var penyewa []models.Penyewa
	if err := database.DB.Find(&penyewa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch penyewa"})
		return
	}
	c.JSON(http.StatusOK, penyewa)
}

func CreatePenyewa(c *gin.Context) {
	var input struct {
		Nama         string `json:"nama" binding:"required"`
		Kontak       string `json:"kontak" binding:"required"`
		KamarID      uint   `json:"kamar_id" binding:"required"`
		TanggalMasuk string `json:"tanggal_masuk" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	tanggalMasuk, err := time.Parse("2006-01-02", input.TanggalMasuk)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}
	penyewa := models.Penyewa{
		Nama:         input.Nama,
		Kontak:       input.Kontak,
		KamarID:      input.KamarID,
		TanggalMasuk: tanggalMasuk,
	}
	if err := database.DB.Create(&penyewa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create penyewa"})
		return
	}
	// Update kamar status to Terisi
	var kamar models.Kamar
	if err := database.DB.First(&kamar, input.KamarID).Error; err == nil {
		kamar.Status = "Terisi"
		kamar.PenyewaID = &penyewa.ID
		database.DB.Save(&kamar)
	}
	c.JSON(http.StatusCreated, penyewa)
}

func UpdatePenyewa(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var penyewa models.Penyewa
	if err := database.DB.First(&penyewa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Penyewa not found"})
		return
	}
	var input struct {
		Nama         string `json:"nama"`
		Kontak       string `json:"kontak"`
		KamarID      uint   `json:"kamar_id"`
		TanggalMasuk string `json:"tanggal_masuk"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Nama != "" {
		penyewa.Nama = input.Nama
	}
	if input.Kontak != "" {
		penyewa.Kontak = input.Kontak
	}
	if input.KamarID != 0 {
		penyewa.KamarID = input.KamarID
	}
	if input.TanggalMasuk != "" {
		tanggalMasuk, err := time.Parse("2006-01-02", input.TanggalMasuk)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		penyewa.TanggalMasuk = tanggalMasuk
	}
	if err := database.DB.Save(&penyewa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update penyewa"})
		return
	}
	c.JSON(http.StatusOK, penyewa)
}

func DeletePenyewa(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var penyewa models.Penyewa
	if err := database.DB.First(&penyewa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Penyewa not found"})
		return
	}
	// Update kamar status to Tersedia
	var kamar models.Kamar
	if err := database.DB.First(&kamar, penyewa.KamarID).Error; err == nil {
		kamar.Status = "Tersedia"
		kamar.PenyewaID = nil
		database.DB.Save(&kamar)
	}
	if err := database.DB.Delete(&penyewa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete penyewa"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Penyewa deleted"})
}
