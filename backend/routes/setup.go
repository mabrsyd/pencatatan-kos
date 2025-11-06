package routes

import (
	"kos-muhandis/backend/controllers"
	"kos-muhandis/backend/middlewares"

	"github.com/gin-contrib/logger"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Add logging middleware
	r.Use(logger.SetLogger())

	// Public routes
	r.POST("/login", controllers.Login)
	r.POST("/register", controllers.Register)

	// Protected routes
	protected := r.Group("/")
	protected.Use(middlewares.AuthMiddleware())
	{
		// Dashboard
		protected.GET("/dashboard", controllers.GetDashboard)

		// Kamar
		protected.GET("/kamar", controllers.GetKamar)
		protected.POST("/kamar", controllers.CreateKamar)
		protected.PUT("/kamar/:id", controllers.UpdateKamar)
		protected.DELETE("/kamar/:id", controllers.DeleteKamar)

		// Penyewa
		protected.GET("/penyewa", controllers.GetPenyewa)
		protected.GET("/penyewa/:id", controllers.GetPenyewaByID)
		protected.POST("/penyewa", controllers.CreatePenyewa)
		protected.PUT("/penyewa/:id", controllers.UpdatePenyewa)
		protected.DELETE("/penyewa/:id", controllers.DeletePenyewa)

		// Tagihan
		protected.GET("/tagihan", controllers.GetTagihan)
		protected.GET("/tagihan/filtered", controllers.GetTagihanFiltered)
		protected.GET("/penyewa/:id/tagihan", controllers.GetTagihanByPenyewa)
		protected.POST("/tagihan", controllers.CreateTagihan)
		protected.PUT("/tagihan/:id", controllers.UpdateTagihan)
		protected.DELETE("/tagihan/:id", controllers.DeleteTagihan)
		protected.POST("/tagihan/fix-terbayar", controllers.FixTerbayarMassal)

		// Transaksi
		protected.GET("/transaksi", controllers.GetTransaksi)
		protected.POST("/transaksi", controllers.CreateTransaksi)
		protected.PUT("/transaksi/:id", controllers.UpdateTransaksi)
		protected.DELETE("/transaksi/:id", controllers.DeleteTransaksi)

		// Users
		protected.GET("/users", controllers.GetUsers)
		protected.POST("/users", controllers.CreateUser)
		protected.PUT("/users/:id", controllers.UpdateUser)
		protected.DELETE("/users/:id", controllers.DeleteUser)

		// Generate monthly bills
		protected.POST("/generate-bills", controllers.GenerateMonthlyBills)

		// Notifikasi
		protected.GET("/notifikasi", controllers.GetNotifikasiList)
		protected.GET("/notifikasi/dashboard", controllers.GetNotifikasiDashboard)
		protected.POST("/notifikasi/check", controllers.CheckAndCreateNotifikasi)
		protected.PUT("/notifikasi/:id/read", controllers.MarkNotifikasiAsRead)
		protected.DELETE("/notifikasi/:id", controllers.DeleteNotifikasi)

		// Reports
		protected.GET("/report/monthly", controllers.GetMonthlyReport)
		protected.GET("/report/yearly", controllers.GetYearlyReport)
		protected.GET("/report/detail", controllers.GetDetailReport)
		protected.GET("/report/cashflow", controllers.GetCashFlowProjection)

		// WhatsApp Integration
		protected.POST("/whatsapp/send", controllers.SendWhatsAppReminder)
		protected.POST("/whatsapp/broadcast", controllers.SendBroadcastReminder)
		protected.GET("/whatsapp/settings/:id", controllers.GetWhatsAppSettings)
		protected.PUT("/whatsapp/settings/:id", controllers.UpdateWhatsAppSettings)
		protected.POST("/whatsapp/test", controllers.TestWhatsAppMessage)
	}
}
