package routes

import (
	"kos-muhandis/backend/controllers"
	"kos-muhandis/backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
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
		protected.POST("/penyewa", controllers.CreatePenyewa)
		protected.PUT("/penyewa/:id", controllers.UpdatePenyewa)
		protected.DELETE("/penyewa/:id", controllers.DeletePenyewa)

		// Tagihan
		protected.GET("/tagihan", controllers.GetTagihan)
		protected.POST("/tagihan", controllers.CreateTagihan)
		protected.PUT("/tagihan/:id", controllers.UpdateTagihan)
		protected.DELETE("/tagihan/:id", controllers.DeleteTagihan)

		// Transaksi
		protected.GET("/transaksi", controllers.GetTransaksi)
		protected.POST("/transaksi", controllers.CreateTransaksi)
		protected.DELETE("/transaksi/:id", controllers.DeleteTransaksi)

		// Pengeluaran
		protected.GET("/pengeluaran", controllers.GetPengeluaran)
		protected.POST("/pengeluaran", controllers.CreatePengeluaran)
		protected.DELETE("/pengeluaran/:id", controllers.DeletePengeluaran)

		// Generate monthly bills
		protected.POST("/generate-bills", controllers.GenerateMonthlyBills)
	}
}
