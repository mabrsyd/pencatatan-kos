package controllers

import (
	"fmt"
	"net/http"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/models"

	"github.com/gin-gonic/gin"
)

// SendWhatsAppReminder - Send WhatsApp reminder to penyewa
func SendWhatsAppReminder(c *gin.Context) {
	var input struct {
		PenyewaID uint   `json:"penyewa_id" binding:"required"`
		TagihanID uint   `json:"tagihan_id" binding:"required"`
		Message   string `json:"message" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	// Get penyewa info
	var penyewa models.Penyewa
	if err := database.DB.First(&penyewa, input.PenyewaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Penyewa not found"})
		return
	}

	// Get tagihan info
	var tagihan models.Tagihan
	if err := database.DB.First(&tagihan, input.TagihanID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tagihan not found"})
		return
	}

	// Validate phone number
	if penyewa.NoHP == nil || *penyewa.NoHP == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Penyewa doesn't have phone number"})
		return
	}

	// Format phone number (add +62 if needed)
	phoneNumber := *penyewa.NoHP
	if phoneNumber[0:1] == "0" {
		phoneNumber = "+62" + phoneNumber[1:]
	} else if phoneNumber[0:3] != "+62" {
		phoneNumber = "+62" + phoneNumber
	}

	// Build message dengan informasi tagihan
	fullMessage := fmt.Sprintf(
		"Halo %s,\n\n%s\n\nTagihan Bulan: %s\nJumlah: Rp %d\n\nMohon segera melakukan pembayaran.\n\nTerima kasih.",
		penyewa.Nama,
		input.Message,
		tagihan.Bulan,
		tagihan.Jumlah,
	)

	// Send WhatsApp message (using Twilio)
	// Note: Ini adalah implementasi dasar, Anda perlu setup Twilio account
	result := SendViaWhatsApp(phoneNumber, fullMessage)

	if result.Success {
		// Update notification status
		var notif models.Notifikasi
		if err := database.DB.Where("tagihan_id = ? AND penyewa_id = ?", input.TagihanID, input.PenyewaID).
			First(&notif).Error; err == nil {
			database.DB.Model(&notif).Update("status", "sent")
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "WhatsApp reminder sent successfully",
			"phone":   phoneNumber,
		})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to send WhatsApp: " + result.Error,
		})
	}
}

// SendBroadcastReminder - Send broadcast reminder to all penyewa with due bills
func SendBroadcastReminder(c *gin.Context) {
	var notifikasiList []models.Notifikasi
	database.DB.Where("status = ? AND tipe IN ?", "pending", []string{"H-1", "OVERDUE"}).
		Preload("Penyewa").
		Preload("Tagihan").
		Find(&notifikasiList)

	successCount := 0
	failCount := 0

	for _, notif := range notifikasiList {
		phoneNumber := ""
		if notif.Penyewa.NoHP != nil {
			phoneNumber = *notif.Penyewa.NoHP
		}
		if phoneNumber == "" {
			failCount++
			continue
		}

		if phoneNumber[0:1] == "0" {
			phoneNumber = "+62" + phoneNumber[1:]
		} else if phoneNumber[0:3] != "+62" {
			phoneNumber = "+62" + phoneNumber
		}

		result := SendViaWhatsApp(phoneNumber, notif.Message)
		if result.Success {
			database.DB.Model(&notif).Update("status", "sent")
			successCount++
		} else {
			failCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Broadcast reminder completed",
		"success": successCount,
		"failed":  failCount,
		"total":   len(notifikasiList),
	})
}

// WhatsApp Response Structure
type WhatsAppResponse struct {
	Success   bool
	MessageID string
	Error     string
}

// SendViaWhatsApp - Helper function to send WhatsApp message via Twilio
// IMPORTANT: Setup environment variables untuk Twilio credentials
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
func SendViaWhatsApp(toNumber, message string) WhatsAppResponse {
	// TODO: Implement Twilio WhatsApp API integration
	// For now, returning mock success
	//
	// Example implementation:
	// accountSID := os.Getenv("TWILIO_ACCOUNT_SID")
	// authToken := os.Getenv("TWILIO_AUTH_TOKEN")
	// fromNumber := os.Getenv("TWILIO_WHATSAPP_NUMBER") // format: whatsapp:+62...
	// toWhatsApp := "whatsapp:" + toNumber
	//
	// urlStr := "https://api.twilio.com/2010-04-01/Accounts/" + accountSID + "/Messages.json"
	//
	// v := url.Values{}
	// v.Set("From", fromNumber)
	// v.Set("To", toWhatsApp)
	// v.Set("Body", message)
	//
	// req, _ := http.NewRequest("POST", urlStr, strings.NewReader(v.Encode()))
	// req.SetBasicAuth(accountSID, authToken)
	// req.Header.Add("Accept", "application/json")
	// req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	//
	// client := &http.Client{}
	// resp, err := client.Do(req)

	// Mock implementation untuk testing
	return WhatsAppResponse{
		Success:   true,
		MessageID: "mock-msg-id",
		Error:     "",
	}
}

// GetWhatsAppSettings - Get WhatsApp settings untuk penyewa
func GetWhatsAppSettings(c *gin.Context) {
	penyewaID := c.Param("id")

	var penyewa models.Penyewa
	if err := database.DB.First(&penyewa, penyewaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Penyewa not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"penyewa_id": penyewa.ID,
		"nama":       penyewa.Nama,
		"no_hp":      penyewa.NoHP,
		"has_phone":  penyewa.NoHP != nil && *penyewa.NoHP != "",
	})
}

// UpdateWhatsAppSettings - Update WhatsApp number for penyewa
func UpdateWhatsAppSettings(c *gin.Context) {
	penyewaID := c.Param("id")
	var input struct {
		NoHP string `json:"no_hp" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var penyewa models.Penyewa
	if err := database.DB.First(&penyewa, penyewaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Penyewa not found"})
		return
	}

	if err := database.DB.Model(&penyewa).Update("no_hp", input.NoHP).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update phone number"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "WhatsApp number updated successfully"})
}

// TestWhatsAppMessage - Send test message
func TestWhatsAppMessage(c *gin.Context) {
	var input struct {
		ToNumber string `json:"to_number" binding:"required"`
		Message  string `json:"message" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	phoneNumber := input.ToNumber
	if phoneNumber[0:1] == "0" {
		phoneNumber = "+62" + phoneNumber[1:]
	}

	result := SendViaWhatsApp(phoneNumber, input.Message)

	if result.Success {
		c.JSON(http.StatusOK, gin.H{
			"message": "Test message sent successfully",
			"phone":   phoneNumber,
		})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to send test message: " + result.Error,
		})
	}
}
