package controllers

import (
	"net/http"
	"strconv"
	"time"

	"kos-muhandis/backend/database"
	"kos-muhandis/backend/models"

	"github.com/gin-gonic/gin"
)

type ReportSummary struct {
	Periode           string `json:"periode"`
	TotalPendapatan   int    `json:"total_pendapatan"`
	TotalPengeluaran  int    `json:"total_pengeluaran"`
	NetProfit         int    `json:"net_profit"`
	TotalTagihanLunas int    `json:"total_tagihan_lunas"`
	TotalTagihanBelum int    `json:"total_tagihan_belum"`
	TotalOccupancy    int    `json:"total_occupancy"`
	TotalKamar        int    `json:"total_kamar"`
}

type MonthlyReport struct {
	Bulan        string `json:"bulan"`
	Pendapatan   int    `json:"pendapatan"`
	Pengeluaran  int    `json:"pengeluaran"`
	NetProfit    int    `json:"net_profit"`
	TagihanLunas int    `json:"tagihan_lunas"`
	TagihanBelum int    `json:"tagihan_belum"`
}

type ReportDetail struct {
	ID      uint
	Tipe    string // "income" or "expense"
	Desc    string
	Jumlah  int
	Tanggal string
}

// GetMonthlyReport - Get laporan bulanan
func GetMonthlyReport(c *gin.Context) {
	tahun := c.Query("tahun")
	if tahun == "" {
		tahun = strconv.Itoa(time.Now().Year())
	}

	var reports []MonthlyReport

	for month := 1; month <= 12; month++ {
		bulanStr := time.Date(time.Now().Year(), time.Month(month), 1, 0, 0, 0, 0, time.UTC).Format("2006-01")

		// Hitung tagihan yang lunas
		var tagihanLunas int64
		database.DB.Model(&models.Tagihan{}).Where("status = ? AND bulan LIKE ?", "Lunas", tahun+"-%").Count(&tagihanLunas)

		// Hitung tagihan belum lunas
		var tagihanBelum int64
		database.DB.Model(&models.Tagihan{}).Where("status != ? AND bulan LIKE ?", "Lunas", tahun+"-%").Count(&tagihanBelum)

		// Hitung total pendapatan dari tagihan yang lunas
		var totalPendapatan int
		database.DB.Model(&models.Tagihan{}).Where("status = ? AND bulan = ?", "Lunas", bulanStr).
			Select("COALESCE(SUM(jumlah), 0)").Row().Scan(&totalPendapatan)

		// Hitung total pengeluaran
		var totalPengeluaran int
		database.DB.Model(&models.Transaksi{}).Where("jenis = ? AND EXTRACT(YEAR FROM tanggal)::TEXT || '-' || LPAD(EXTRACT(MONTH FROM tanggal)::TEXT, 2, '0') = ?", "Pengeluaran", bulanStr).
			Select("COALESCE(SUM(jumlah), 0)").Row().Scan(&totalPengeluaran)

		netProfit := totalPendapatan - totalPengeluaran

		report := MonthlyReport{
			Bulan:        bulanStr,
			Pendapatan:   totalPendapatan,
			Pengeluaran:  totalPengeluaran,
			NetProfit:    netProfit,
			TagihanLunas: int(tagihanLunas),
			TagihanBelum: int(tagihanBelum),
		}
		reports = append(reports, report)
	}

	c.JSON(http.StatusOK, reports)
}

// GetYearlyReport - Get laporan tahunan
func GetYearlyReport(c *gin.Context) {
	tahun := c.Query("tahun")
	if tahun == "" {
		tahun = strconv.Itoa(time.Now().Year())
	}

	var summary ReportSummary
	summary.Periode = tahun

	// Total tagihan yang lunas (pendapatan)
	var totalPendapatan int
	database.DB.Model(&models.Tagihan{}).Where("status = ? AND bulan LIKE ?", "Lunas", tahun+"-%").
		Select("COALESCE(SUM(jumlah), 0)").Row().Scan(&totalPendapatan)

	// Total pengeluaran
	var totalPengeluaran int
	database.DB.Model(&models.Transaksi{}).Where("jenis = ? AND EXTRACT(YEAR FROM tanggal)::TEXT = ?", "Pengeluaran", tahun).
		Select("COALESCE(SUM(jumlah), 0)").Row().Scan(&totalPengeluaran)

	// Total kamar
	var totalKamar int64
	database.DB.Model(&models.Kamar{}).Count(&totalKamar)

	// Total kamar terisi (occupancy)
	var totalOccupancy int64
	database.DB.Model(&models.Kamar{}).Where("status = ?", "Terisi").Count(&totalOccupancy)

	// Total tagihan lunas
	var totalTagihanLunas int64
	database.DB.Model(&models.Tagihan{}).Where("status = ? AND bulan LIKE ?", "Lunas", tahun+"-%").Count(&totalTagihanLunas)

	// Total tagihan belum lunas
	var totalTagihanBelum int64
	database.DB.Model(&models.Tagihan{}).Where("status != ? AND bulan LIKE ?", "Lunas", tahun+"-%").Count(&totalTagihanBelum)

	summary.TotalPendapatan = totalPendapatan
	summary.TotalPengeluaran = totalPengeluaran
	summary.NetProfit = totalPendapatan - totalPengeluaran
	summary.TotalTagihanLunas = int(totalTagihanLunas)
	summary.TotalTagihanBelum = int(totalTagihanBelum)
	summary.TotalKamar = int(totalKamar)
	summary.TotalOccupancy = int(totalOccupancy)

	c.JSON(http.StatusOK, summary)
}

// GetDetailReport - Get detail laporan dengan date range
func GetDetailReport(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate == "" || endDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start_date and end_date are required"})
		return
	}

	var details []map[string]interface{}

	// Get tagihan yang lunas
	var tagihanList []models.Tagihan
	database.DB.Where("status = ?", "Lunas").Find(&tagihanList)

	for _, tagihan := range tagihanList {
		details = append(details, map[string]interface{}{
			"tipe":      "Pendapatan",
			"deskripsi": "Pembayaran Tagihan - " + tagihan.Bulan,
			"jumlah":    tagihan.Jumlah,
			"tanggal":   tagihan.UpdatedAt.Format("2006-01-02"),
		})
	}

	// Get transaksi
	var transaksiList []models.Transaksi
	database.DB.Where("tanggal BETWEEN ? AND ?", startDate, endDate).Find(&transaksiList)

	for _, transaksi := range transaksiList {
		details = append(details, map[string]interface{}{
			"tipe":      transaksi.Jenis,
			"deskripsi": transaksi.Kategori,
			"jumlah":    transaksi.Jumlah,
			"tanggal":   transaksi.Tanggal.Format("2006-01-02"),
		})
	}

	c.JSON(http.StatusOK, details)
}

// GetCashFlowProjection - Get proyeksi cash flow 6 bulan ke depan
func GetCashFlowProjection(c *gin.Context) {
	var projections []map[string]interface{}
	today := time.Now()

	for i := 0; i < 6; i++ {
		projectionMonth := today.AddDate(0, i, 0)
		monthStr := projectionMonth.Format("2006-01")

		// Estimasi pendapatan dari kamar terisi
		var totalKamarTerisi int64
		database.DB.Model(&models.Kamar{}).Where("status = ?", "Terisi").Count(&totalKamarTerisi)

		// Get average kamar price
		var avgPrice int
		database.DB.Model(&models.Kamar{}).Where("status = ?", "Terisi").
			Select("COALESCE(AVG(harga), 0)").Row().Scan(&avgPrice)

		estimasiPendapatan := int(totalKamarTerisi) * avgPrice

		// Get historical pengeluaran average
		var avgPengeluaran int
		database.DB.Model(&models.Transaksi{}).Where("jenis = ?", "Pengeluaran").
			Select("COALESCE(AVG(jumlah), 0)").Row().Scan(&avgPengeluaran)

		// Hitung jumlah pengeluaran bulan sebelumnya
		lastMonth := projectionMonth.AddDate(0, -1, 0)
		lastMonthStr := lastMonth.Format("2006-01")

		var lastMonthPengeluaran int
		database.DB.Model(&models.Transaksi{}).Where("jenis = ? AND EXTRACT(YEAR FROM tanggal)::TEXT || '-' || LPAD(EXTRACT(MONTH FROM tanggal)::TEXT, 2, '0') = ?", "Pengeluaran", lastMonthStr).
			Select("COALESCE(SUM(jumlah), 0)").Row().Scan(&lastMonthPengeluaran)

		netProfit := estimasiPendapatan - lastMonthPengeluaran

		projections = append(projections, map[string]interface{}{
			"bulan":                 monthStr,
			"estimasi_pendapatan":   estimasiPendapatan,
			"estimasi_pengeluaran":  lastMonthPengeluaran,
			"net_profit_projection": netProfit,
		})
	}

	c.JSON(http.StatusOK, projections)
}
