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

		// Transaksi
		protected.GET("/transaksi", controllers.GetTransaksi)
		protected.POST("/transaksi", controllers.CreateTransaksi)
		protected.DELETE("/transaksi/:id", controllers.DeleteTransaksi)

		// Generate monthly bills
		protected.POST("/generate-bills", controllers.GenerateMonthlyBills)
	}
}
