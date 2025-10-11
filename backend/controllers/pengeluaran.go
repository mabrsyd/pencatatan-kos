package controllers

import (
	"net/http"
	"strconv"
	"time"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/models"

	"github.com/gin-gonic/gin"
)

func GetPengeluaran(c *gin.Context) {
	var pengeluaran []models.Pengeluaran
	if err := database.DB.Find(&pengeluaran).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pengeluaran"})
		return
	}
	c.JSON(http.StatusOK, pengeluaran)
}

func CreatePengeluaran(c *gin.Context) {
	var input struct {
		Kategori   string `json:"kategori" binding:"required"`
		Jumlah     int    `json:"jumlah" binding:"required"`
		Keterangan string `json:"keterangan"`
		Tanggal    string `json:"tanggal" binding:"required"`
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
	pengeluaran := models.Pengeluaran{
		Kategori:   input.Kategori,
		Jumlah:     input.Jumlah,
		Keterangan: input.Keterangan,
		Tanggal:    tanggal,
	}
	if err := database.DB.Create(&pengeluaran).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create pengeluaran"})
		return
	}
	c.JSON(http.StatusCreated, pengeluaran)
}

func DeletePengeluaran(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := database.DB.Delete(&models.Pengeluaran{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pengeluaran"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pengeluaran deleted"})
}
