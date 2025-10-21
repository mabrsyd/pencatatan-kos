'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { motion } from 'framer-motion'
import Sidebar from '../../components/Sidebar'
import { showError } from '../../components/toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Home, DollarSign, AlertTriangle, Activity, Calendar, CreditCard } from 'lucide-react'

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('http://localhost:8080/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
        showError('Gagal memuat data dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebarCollapsed')
      setSidebarCollapsed(saved ? JSON.parse(saved) : false)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (isLoading) return (
    <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Sidebar />
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-4 overflow-y-auto h-screen">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="h-8 bg-border dark:bg-dark-border rounded-lg w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-border dark:bg-dark-border rounded w-96 animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-border dark:bg-dark-border rounded-lg animate-pulse"></div>
                </div>
                <div className="h-3 bg-border dark:bg-dark-border rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-6 bg-border dark:bg-dark-border rounded w-16 animate-pulse"></div>
              </motion.div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="h-5 bg-border dark:bg-dark-border rounded w-32 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-border dark:bg-dark-border rounded w-40 animate-pulse"></div>
                  </div>
                  <div className="w-8 h-8 bg-border dark:bg-dark-border rounded-lg animate-pulse"></div>
                </div>
                <div className="h-64 bg-border dark:bg-dark-border rounded animate-pulse"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const pieData = [
    { name: 'Tersedia', value: data.charts.hunianKamar.tersedia, color: '#10B981' },
    { name: 'Terisi', value: data.charts.hunianKamar.terisi, color: '#3B82F6' },
    { name: 'Perbaikan', value: data.charts.hunianKamar.perbaikan, color: '#F59E0B' },
  ]

  const statsCards = [
    {
      title: 'Total Kamar',
      value: data.stats.totalKamar,
      icon: Home,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    {
      title: 'Total Penyewa',
      value: data.stats.totalPenyewa,
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${data.stats.totalPendapatan.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20'
    },
    {
      title: 'Tagihan Belum Dibayar',
      value: data.stats.tagihanBelum,
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
    }
  ]

  return (
    <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Sidebar />
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-4 overflow-y-auto h-screen">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-1">Dashboard Overview</h1>
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Welcome back! Here's what's happening with your kos management.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsCards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="relative z-10">
                    <motion.div
                      className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${card.color} mb-3 shadow-sm`}
                      whileHover={{ rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Icon size={18} className="text-white" />
                    </motion.div>
                    <h3 className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary mb-1">{card.title}</h3>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary">{card.value}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 mb-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Pendapatan Bulanan</h3>
                  <p className="text-text-secondary dark:text-dark-text-secondary text-xs">Revenue trends over time</p>
                </div>
                <motion.div
                  className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-sm"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <TrendingUp size={16} className="text-white" />
                </motion.div>
              </div>
              <LineChart width={400} height={250} data={data.charts.pendapatanBulanan}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bulan" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', strokeWidth: 1, r: 4 }}
                  activeDot={{ r: 6, stroke: 'var(--primary)', strokeWidth: 1 }}
                />
              </LineChart>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Room Occupancy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Tingkat Hunian Kamar</h3>
                  <p className="text-text-secondary dark:text-dark-text-secondary text-xs">Current room occupancy status</p>
                </div>
                <motion.div
                  className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-sm"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Home size={16} className="text-white" />
                </motion.div>
              </div>
              <div className="flex items-center justify-center">
                <PieChart width={300} height={250}>
                  <Pie
                    data={pieData}
                    cx={150}
                    cy={125}
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
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Transaksi Terbaru</h3>
                  <p className="text-text-secondary dark:text-dark-text-secondary text-xs">Latest financial activities</p>
                </div>
                <motion.div
                  className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg shadow-sm"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CreditCard size={16} className="text-white" />
                </motion.div>
              </div>
              <div className="space-y-3">
                {data.transaksiTerbaru.slice(0, 5).map((transaksi: any, index: number) => (
                  <div
                    key={transaksi.ID}
                    className="flex items-center justify-between p-3 bg-bg-primary dark:bg-dark-bg-primary rounded-lg border border-border dark:border-dark-border hover:shadow-sm transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
                        <Activity size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary dark:text-dark-text-primary text-sm">{transaksi.kategori}</p>
                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{transaksi.jenis}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text-primary dark:text-dark-text-primary text-sm">Rp {transaksi.jumlah.toLocaleString()}</p>
                      <p className="text-xs text-text-secondary dark:text-dark-text-secondary flex items-center">
                        <Calendar size={10} className="mr-1" />
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}