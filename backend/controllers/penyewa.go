package controllers

import (
	"net/http"
	"strconv"
	"strings"
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

	// Calculate 3 months: previous, current, next in Jakarta timezone
	jakartaLocation, _ := time.LoadLocation("Asia/Jakarta")
	now := time.Now().In(jakartaLocation)

	// Get 3 months (previous, current, next)
	months := make([]string, 3)
	for i := -1; i <= 1; i++ {
		month := now.AddDate(0, i, 0)
		months[i+1] = month.Format("2006-01")
	}

	// Preload all tagihan for all penyewa
	var allTagihan []models.Tagihan
	penyewaIDs := make([]uint, len(penyewa))
	for i, p := range penyewa {
		penyewaIDs[i] = p.ID
	}
	if len(penyewaIDs) > 0 {
		database.DB.Where("penyewa_id IN ?", penyewaIDs).Find(&allTagihan)
	}

	// Create response with billing preview
	type PenyewaWithPreview struct {
		models.Penyewa
		TagihanPreview map[string]string `json:"tagihan_preview"`
	}

	response := make([]PenyewaWithPreview, len(penyewa))

	for i, p := range penyewa {
		preview := make(map[string]string)

		// Filter tagihan for this penyewa and check each month
		penyewaTagihan := make([]models.Tagihan, 0)
		for _, t := range allTagihan {
			if t.PenyewaID == p.ID {
				penyewaTagihan = append(penyewaTagihan, t)
			}
		}

		for _, month := range months {
			found := false
			for _, tagihan := range penyewaTagihan {
				if strings.HasPrefix(tagihan.Bulan, month) {
					preview[month] = tagihan.Status
					found = true
					break
				}
			}
			if !found {
				preview[month] = "Tidak Ada"
			}
		}

		response[i] = PenyewaWithPreview{
			Penyewa:        p,
			TagihanPreview: preview,
		}
	}

	c.JSON(http.StatusOK, response)
}

func GetPenyewaByID(c *gin.Context) {
	id := c.Param("id")
	var penyewa models.Penyewa
	if err := database.DB.Preload("Kamar").First(&penyewa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Penyewa not found"})
		return
	}
	c.JSON(http.StatusOK, penyewa)
}

func CreatePenyewa(c *gin.Context) {
	var input struct {
		Nama         string  `json:"nama" binding:"required"`
		Email        *string `json:"email"`
		NoHP         *string `json:"no_hp"`
		Alamat       *string `json:"alamat"`
		KamarID      uint    `json:"kamar_id" binding:"required"`
		TanggalMasuk *string `json:"tanggal_masuk"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var tanggalMasuk *time.Time
	if input.TanggalMasuk != nil && *input.TanggalMasuk != "" {
		parsedTime, err := time.Parse("2006-01-02", *input.TanggalMasuk)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		tanggalMasuk = &parsedTime
	}

	penyewa := models.Penyewa{
		Nama:         input.Nama,
		Email:        input.Email,
		NoHP:         input.NoHP,
		Alamat:       input.Alamat,
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
		Nama         string  `json:"nama"`
		Email        *string `json:"email"`
		NoHP         *string `json:"no_hp"`
		Alamat       *string `json:"alamat"`
		KamarID      uint    `json:"kamar_id"`
		TanggalMasuk *string `json:"tanggal_masuk"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Nama != "" {
		penyewa.Nama = input.Nama
	}
	if input.Email != nil {
		penyewa.Email = input.Email
	}
	if input.NoHP != nil {
		penyewa.NoHP = input.NoHP
	}
	if input.Alamat != nil {
		penyewa.Alamat = input.Alamat
	}
	if input.KamarID != 0 {
		penyewa.KamarID = input.KamarID
	}
	if input.TanggalMasuk != nil && *input.TanggalMasuk != "" {
		tanggalMasuk, err := time.Parse("2006-01-02", *input.TanggalMasuk)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		penyewa.TanggalMasuk = &tanggalMasuk
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
