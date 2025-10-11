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

func CreateTagihan(c *gin.Context) {
	var input struct {
		PenyewaID uint   `json:"penyewa_id" binding:"required"`
		KamarID   uint   `json:"kamar_id" binding:"required"`
		Bulan     string `json:"bulan" binding:"required"`
		Jumlah    int    `json:"jumlah" binding:"required"`
		Status    string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	tagihan := models.Tagihan{
		PenyewaID: input.PenyewaID,
		KamarID:   input.KamarID,
		Bulan:     input.Bulan,
		Jumlah:    input.Jumlah,
		Status:    input.Status,
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
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Status != "" {
		tagihan.Status = input.Status
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
