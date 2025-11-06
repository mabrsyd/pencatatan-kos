'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, FileText, Calendar } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface MonthlyReport {
  bulan: string
  pendapatan: number
  pengeluaran: number
  net_profit: number
  tagihan_lunas: number
  tagihan_belum: number
}

interface YearlyReport {
  periode: string
  total_pendapatan: number
  total_pengeluaran: number
  net_profit: number
  total_tagihan_lunas: number
  total_tagihan_belum: number
  total_occupancy: number
  total_kamar: number
}

interface CashFlowData {
  bulan: string
  estimasi_pendapatan: number
  estimasi_pengeluaran: number
  net_profit_projection: number
}

const COLORS = ['#10b981', '#f97316', '#3b82f6', '#8b5cf6']

export default function ReportsPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyReport[]>([])
  const [yearlyData, setYearlyData] = useState<YearlyReport | null>(null)
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchReports()
  }, [selectedYear, router])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')

      const [monthlyRes, yearlyRes, cashFlowRes] = await Promise.all([
        axios.get(`http://localhost:8080/report/monthly?tahun=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8080/report/yearly?tahun=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/report/cashflow', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      setMonthlyData(monthlyRes.data || [])
      setYearlyData(yearlyRes.data)
      setCashFlowData(cashFlowRes.data || [])
    } catch (error) {
      console.error('Failed to fetch reports', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Laporan Keuangan Kos Muhandis', 20, 20)
    doc.setFontSize(10)
    doc.text(`Periode: ${selectedYear}`, 20, 30)
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, 38)

    // Summary
    let yPos = 50
    doc.setFontSize(12)
    doc.text('RINGKASAN KEUANGAN', 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    const summaryData = [
      ['Total Pendapatan', `Rp ${yearlyData?.total_pendapatan.toLocaleString() || '0'}`],
      ['Total Pengeluaran', `Rp ${yearlyData?.total_pengeluaran.toLocaleString() || '0'}`],
      ['Net Profit', `Rp ${yearlyData?.net_profit.toLocaleString() || '0'}`],
      ['Occupancy Rate', `${((yearlyData?.total_occupancy ?? 0) / (yearlyData?.total_kamar ?? 1) * 100).toFixed(1)}%`],
    ]

    ;(doc as any).autoTable({
      head: [['Keterangan', 'Nilai']],
      body: summaryData,
      startY: yPos,
    })

    yPos = (doc as any).lastAutoTable.finalY + 20

    // Monthly Detail
    doc.setFontSize(12)
    doc.text('LAPORAN BULANAN', 20, yPos)
    yPos += 10

    const monthlyTableData = monthlyData.map(row => [
      row.bulan,
      `Rp ${row.pendapatan.toLocaleString()}`,
      `Rp ${row.pengeluaran.toLocaleString()}`,
      `Rp ${row.net_profit.toLocaleString()}`,
    ])

    ;(doc as any).autoTable({
      head: [['Bulan', 'Pendapatan', 'Pengeluaran', 'Net Profit']],
      body: monthlyTableData,
      startY: yPos,
    })

    doc.save(`laporan-keuangan-${selectedYear}.pdf`)
  }

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ['LAPORAN KEUANGAN KOS MUHANDIS'],
      [`Periode: ${selectedYear}`],
      [],
      ['Keterangan', 'Nilai'],
      ['Total Pendapatan', yearlyData?.total_pendapatan || 0],
      ['Total Pengeluaran', yearlyData?.total_pengeluaran || 0],
      ['Net Profit', yearlyData?.net_profit || 0],
      ['Total Kamar', yearlyData?.total_kamar || 0],
      ['Kamar Terisi', yearlyData?.total_occupancy || 0],
      ['Occupancy Rate (%)', ((yearlyData?.total_occupancy ?? 0) / (yearlyData?.total_kamar ?? 1) * 100).toFixed(1)],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan')

    // Monthly detail sheet
    const monthlyTableData = [
      ['LAPORAN BULANAN'],
      [],
      ['Bulan', 'Pendapatan', 'Pengeluaran', 'Net Profit', 'Tagihan Lunas', 'Tagihan Belum'],
      ...monthlyData.map(row => [
        row.bulan,
        row.pendapatan,
        row.pengeluaran,
        row.net_profit,
        row.tagihan_lunas,
        row.tagihan_belum,
      ])
    ]

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyTableData)
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Bulanan')

    XLSX.writeFile(workbook, `laporan-keuangan-${selectedYear}.xlsx`)
  }

  return (
    <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Sidebar setIsCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-500 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-4 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-1">Laporan Keuangan</h1>
            <p className="text-text-secondary dark:text-dark-text-secondary">Analisis finansial dan cash flow kos</p>
          </div>

          {/* Controls */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg"
              >
                {[2022, 2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-border dark:bg-dark-border rounded"></div>
              <div className="h-64 bg-border dark:bg-dark-border rounded"></div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border">
                  <h3 className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Pendapatan</h3>
                  <p className="text-2xl font-bold text-green-500 mt-2">Rp {yearlyData?.total_pendapatan.toLocaleString()}</p>
                </div>
                <div className="bg-surface dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border">
                  <h3 className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Pengeluaran</h3>
                  <p className="text-2xl font-bold text-red-500 mt-2">Rp {yearlyData?.total_pengeluaran.toLocaleString()}</p>
                </div>
                <div className="bg-surface dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border">
                  <h3 className="text-sm text-text-secondary dark:text-dark-text-secondary">Net Profit</h3>
                  <p className="text-2xl font-bold text-blue-500 mt-2">Rp {yearlyData?.net_profit.toLocaleString()}</p>
                </div>
                <div className="bg-surface dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border">
                  <h3 className="text-sm text-text-secondary dark:text-dark-text-secondary">Occupancy Rate</h3>
                  <p className="text-2xl font-bold text-purple-500 mt-2">
                    {((yearlyData?.total_occupancy ?? 0) / (yearlyData?.total_kamar ?? 1) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue vs Expense */}
                <div className="bg-surface dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border">
                  <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">Pendapatan vs Pengeluaran Bulanan</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bulan" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pendapatan" fill="#10b981" name="Pendapatan" />
                      <Bar dataKey="pengeluaran" fill="#ef4444" name="Pengeluaran" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Net Profit */}
                <div className="bg-surface dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border">
                  <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">Net Profit Bulanan</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bulan" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="net_profit" stroke="#3b82f6" strokeWidth={2} name="Net Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Cash Flow Projection */}
                <div className="bg-surface dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border">
                  <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">Proyeksi Cash Flow 6 Bulan</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bulan" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="estimasi_pendapatan" fill="#10b981" name="Est. Pendapatan" />
                      <Bar dataKey="estimasi_pengeluaran" fill="#ef4444" name="Est. Pengeluaran" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tagihan Status */}
                <div className="bg-surface dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border">
                  <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">Status Tagihan</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Lunas', value: yearlyData?.total_tagihan_lunas || 0 },
                          { name: 'Belum Lunas', value: yearlyData?.total_tagihan_belum || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Detail Table */}
              <div className="bg-surface dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border overflow-x-auto">
                <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-4">Detail Bulanan</h3>
                <table className="w-full text-sm">
                  <thead className="border-b border-border dark:border-dark-border">
                    <tr>
                      <th className="text-left py-2 px-4 text-text-secondary">Bulan</th>
                      <th className="text-right py-2 px-4 text-text-secondary">Pendapatan</th>
                      <th className="text-right py-2 px-4 text-text-secondary">Pengeluaran</th>
                      <th className="text-right py-2 px-4 text-text-secondary">Net Profit</th>
                      <th className="text-center py-2 px-4 text-text-secondary">Tagihan Lunas</th>
                      <th className="text-center py-2 px-4 text-text-secondary">Tagihan Belum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-dark-border">
                    {monthlyData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-hover dark:hover:bg-dark-hover">
                        <td className="py-3 px-4">{row.bulan}</td>
                        <td className="text-right py-3 px-4 text-green-500">Rp {row.pendapatan.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-red-500">Rp {row.pengeluaran.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-blue-500">Rp {row.net_profit.toLocaleString()}</td>
                        <td className="text-center py-3 px-4">{row.tagihan_lunas}</td>
                        <td className="text-center py-3 px-4">{row.tagihan_belum}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
