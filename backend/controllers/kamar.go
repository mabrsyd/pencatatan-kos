package controllers

import (
	"net/http"
	"strconv"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/models"

	"github.com/gin-gonic/gin"
)

func GetKamar(c *gin.Context) {
	var kamar []models.Kamar
	if err := database.DB.Preload("Penyewa").Find(&kamar).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch kamar"})
		return
	}
	c.JSON(http.StatusOK, kamar)
}

func CreateKamar(c *gin.Context) {
	var input struct {
		Nama   string `json:"nama" binding:"required"`
		Harga  int    `json:"harga" binding:"required"`
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	kamar := models.Kamar{
		Nama:   input.Nama,
		Harga:  input.Harga,
		Status: input.Status,
	}
	if err := database.DB.Create(&kamar).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create kamar"})
		return
	}
	c.JSON(http.StatusCreated, kamar)
}

func UpdateKamar(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var kamar models.Kamar
	if err := database.DB.First(&kamar, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kamar not found"})
		return
	}
	var input struct {
		Nama      string `json:"nama"`
		Harga     int    `json:"harga"`
		Status    string `json:"status"`
		PenyewaID *uint  `json:"penyewa_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Nama != "" {
		kamar.Nama = input.Nama
	}
	if input.Harga != 0 {
		kamar.Harga = input.Harga
	}
	if input.Status != "" {
		kamar.Status = input.Status
	}
	if input.PenyewaID != nil {
		kamar.PenyewaID = input.PenyewaID
	}
	if err := database.DB.Save(&kamar).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update kamar"})
		return
	}
	c.JSON(http.StatusOK, kamar)
}

func DeleteKamar(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := database.DB.Delete(&models.Kamar{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete kamar"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Kamar deleted"})
}
