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
	var transaksi []models.Transaksi
	if err := database.DB.Find(&transaksi).Error; err != nil {
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

func DeleteTransaksi(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := database.DB.Delete(&models.Transaksi{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete transaksi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Transaksi deleted"})
}
