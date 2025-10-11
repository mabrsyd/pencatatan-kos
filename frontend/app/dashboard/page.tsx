'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [data, setData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      }
    }

    fetchData()
  }, [router])

  if (!data) return <div>Loading...</div>

  const pieData = [
    { name: 'Tersedia', value: data.charts.hunianKamar.tersedia, color: '#C8A2C8' },
    { name: 'Terisi', value: data.charts.hunianKamar.terisi, color: '#A085A0' },
    { name: 'Perbaikan', value: data.charts.hunianKamar.perbaikan, color: '#8884d8' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-lilac-dark mb-6">Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Kamar</h3>
              <p className="text-2xl font-bold text-lilac-dark">{data.stats.totalKamar}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Penyewa</h3>
              <p className="text-2xl font-bold text-lilac-dark">{data.stats.totalPenyewa}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Pendapatan</h3>
              <p className="text-2xl font-bold text-lilac-dark">Rp {data.stats.totalPendapatan.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Tagihan Belum Dibayar</h3>
              <p className="text-2xl font-bold text-red-500">{data.stats.tagihanBelum}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Pendapatan Bulanan</h3>
              <LineChart width={400} height={300} data={data.charts.pendapatanBulanan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#C8A2C8" strokeWidth={2} />
              </LineChart>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Pengeluaran Bulanan</h3>
              <BarChart width={400} height={300} data={data.charts.pengeluaranBulanan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#A085A0" />
              </BarChart>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Tingkat Hunian Kamar</h3>
              <PieChart width={400} height={300}>
                <Pie
                  data={pieData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Transaksi Terbaru</h3>
              <div className="space-y-2">
                {data.transaksiTerbaru.map((transaksi: any) => (
                  <div key={transaksi.ID} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">{transaksi.kategori}</p>
                      <p className="text-sm text-gray-500">{transaksi.jenis}</p>
                    </div>
                    <p className="font-semibold">Rp {transaksi.jumlah.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}