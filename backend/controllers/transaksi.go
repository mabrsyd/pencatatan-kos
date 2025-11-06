package controllers

import (
	"net/http"
	"strconv"
	"time"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/models"

	"github.com/gin-gonic/gin"
)

func GetTransaksi(c *gin.Context) {
	jenis := c.Query("jenis")
	kategori := c.Query("kategori")
	bulan := c.Query("bulan")

	var transaksi []models.Transaksi
	query := database.DB

	if jenis != "" {
		query = query.Where("jenis = ?", jenis)
	}
	if kategori != "" {
		query = query.Where("kategori = ?", kategori)
	}
	if bulan != "" {
		// Filter by month (format: 2006-01)
		query = query.Where("EXTRACT(YEAR FROM tanggal)::TEXT || '-' || LPAD(EXTRACT(MONTH FROM tanggal)::TEXT, 2, '0') = ?", bulan)
	}

	if err := query.Order("tanggal DESC").Find(&transaksi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transaksi"})
		return
	}
	c.JSON(http.StatusOK, transaksi)
}

func CreateTransaksi(c *gin.Context) {
	var input struct {
		Jenis    string `json:"jenis" binding:"required"`
		Kategori string `json:"kategori" binding:"required"`
		Jumlah   int    `json:"jumlah" binding:"required"`
		Tanggal  string `json:"tanggal" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	tanggal, err := time.Parse("2006-01-02", input.Tanggal)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}
	transaksi := models.Transaksi{
		Jenis:    input.Jenis,
		Kategori: input.Kategori,
		Jumlah:   input.Jumlah,
		Tanggal:  tanggal,
	}
	if err := database.DB.Create(&transaksi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaksi"})
		return
	}
	c.JSON(http.StatusCreated, transaksi)
}

func UpdateTransaksi(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var transaksi models.Transaksi
	if err := database.DB.First(&transaksi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaksi not found"})
		return
	}
	var input struct {
		Jenis    string `json:"jenis"`
		Kategori string `json:"kategori"`
		Jumlah   int    `json:"jumlah"`
		Tanggal  string `json:"tanggal"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Jenis != "" {
		transaksi.Jenis = input.Jenis
	}
	if input.Kategori != "" {
		transaksi.Kategori = input.Kategori
	}
	if input.Jumlah != 0 {
		transaksi.Jumlah = input.Jumlah
	}
	if input.Tanggal != "" {
		tanggal, err := time.Parse("2006-01-02", input.Tanggal)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		transaksi.Tanggal = tanggal
	}
	if err := database.DB.Save(&transaksi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update transaksi"})
		return
	}
	c.JSON(http.StatusOK, transaksi)
}

func DeleteTransaksi(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := database.DB.Delete(&models.Transaksi{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete transaksi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Transaksi deleted"})
}
