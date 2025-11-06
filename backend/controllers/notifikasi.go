package controllers

import (
	"net/http"
	"time"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/models"

	"github.com/gin-gonic/gin"
)

// CheckAndCreateNotifikasi - Check tagihan jatuh tempo dan buat notifikasi
func CheckAndCreateNotifikasi(c *gin.Context) {
	var tagihanList []models.Tagihan
	if err := database.DB.Preload("Penyewa").Find(&tagihanList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tagihan"})
		return
	}

	createdCount := 0
	today := time.Now()

	for _, tagihan := range tagihanList {
		// Skip if already Lunas
		if tagihan.Status == "Lunas" {
			continue
		}

		// Parse bulan (format: "2025-11")
		tagihanDate, err := time.Parse("2006-01", tagihan.Bulan)
		if err != nil {
			continue
		}

		// Set tanggal due ke akhir bulan (atau hari pertama bulan berikutnya)
		dueDate := tagihanDate.AddDate(0, 1, -1) // Last day of the month

		// Check berapa hari lagi sampai due
		daysUntilDue := int(dueDate.Sub(today).Hours() / 24)

		var tipeNotifikasi string
		var shouldCreate bool

		if daysUntilDue < 0 {
			// OVERDUE
			tipeNotifikasi = "OVERDUE"
			shouldCreate = true
		} else if daysUntilDue == 0 {
			// H-1 (hari ini deadline)
			tipeNotifikasi = "H-1"
			shouldCreate = true
		} else if daysUntilDue == 3 {
			// H-3
			tipeNotifikasi = "H-3"
			shouldCreate = true
		} else if daysUntilDue == 7 {
			// H-7
			tipeNotifikasi = "H-7"
			shouldCreate = true
		}

		if shouldCreate {
			// Check if notification already exists for this tagihan and tipe
			var existingNotif models.Notifikasi
			if err := database.DB.Where("tagihan_id = ? AND tipe = ?", tagihan.ID, tipeNotifikasi).First(&existingNotif).Error; err != nil {
				// Notification doesn't exist, create it
				notif := models.Notifikasi{
					PenyewaID: tagihan.PenyewaID,
					TagihanID: tagihan.ID,
					Tipe:      tipeNotifikasi,
					Status:    "pending",
					Message:   GenerateNotifikasiMessage(tagihan.Penyewa.Nama, tagihan.Bulan, tagihan.Jumlah, tipeNotifikasi),
				}
				if err := database.DB.Create(&notif).Error; err == nil {
					createdCount++
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Notifikasi check completed",
		"created": createdCount,
	})
}

// GetNotifikasiDashboard - Get summary of due tagihan for dashboard
func GetNotifikasiDashboard(c *gin.Context) {
	var summary models.DueTagihanSummary
	today := time.Now()

	// Get all non-lunas tagihan
	var tagihanList []models.Tagihan
	if err := database.DB.Find(&tagihanList, "status != ?", "Lunas").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tagihan"})
		return
	}

	for _, tagihan := range tagihanList {
		tagihanDate, err := time.Parse("2006-01", tagihan.Bulan)
		if err != nil {
			continue
		}

		dueDate := tagihanDate.AddDate(0, 1, -1)
		daysUntilDue := int(dueDate.Sub(today).Hours() / 24)

		if daysUntilDue < 0 {
			summary.TotalTertunggak++
			summary.JumlahTotalTertunggak += tagihan.Jumlah
		} else if daysUntilDue == 0 {
			summary.TotalKritis++
			summary.JumlahTotalKritis += tagihan.Jumlah
		} else if daysUntilDue <= 3 {
			summary.TotalMendesak++
			summary.JumlahTotalMendesak += tagihan.Jumlah
		} else if daysUntilDue <= 7 {
			summary.TotalJatuhTempo++
			summary.JumlahTotalDue += tagihan.Jumlah
		}
	}

	c.JSON(http.StatusOK, summary)
}

// GetNotifikasiList - Get list of notifications
func GetNotifikasiList(c *gin.Context) {
	var notifikasi []models.NotifikasiResponse

	query := `
		SELECT 
			n.id, n.penyewa_id, p.nama as penyewa_nama, n.tagihan_id, 
			n.tipe, n.status, n.message, n.sent_at, t.bulan, t.jumlah, n.created_at
		FROM notifikasi n
		JOIN penyewa p ON n.penyewa_id = p.id
		JOIN tagihan t ON n.tagihan_id = t.id
		WHERE n.deleted_at IS NULL
		ORDER BY n.created_at DESC
		LIMIT 50
	`

	if err := database.DB.Raw(query).Scan(&notifikasi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifikasi"})
		return
	}

	c.JSON(http.StatusOK, notifikasi)
}

// MarkNotifikasiAsRead - Mark notification as read
func MarkNotifikasiAsRead(c *gin.Context) {
	id := c.Param("id")
	now := time.Now()

	if err := database.DB.Model(&models.Notifikasi{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":  "read",
		"sent_at": now,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notifikasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notifikasi marked as read"})
}

// DeleteNotifikasi - Delete notification
func DeleteNotifikasi(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Notifikasi{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notifikasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notifikasi deleted"})
}

// Helper function untuk generate message
func GenerateNotifikasiMessage(namaPenyewa string, bulan string, jumlah int, tipe string) string {
	var message string
	switch tipe {
	case "H-7":
		message = "Pengingat: Tagihan bulan " + bulan + " akan jatuh tempo dalam 7 hari"
	case "H-3":
		message = "Perhatian: Tagihan bulan " + bulan + " akan jatuh tempo dalam 3 hari"
	case "H-1":
		message = "Mendesak: Tagihan bulan " + bulan + " jatuh tempo hari ini"
	case "OVERDUE":
		message = "Tertunggak: Tagihan bulan " + bulan + " sudah terlewat"
	}
	return message
}
