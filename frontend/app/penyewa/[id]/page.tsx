'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import axios from 'axios'
import Sidebar from '../../../components/Sidebar'
import ConfirmationModal from '../../../components/ConfirmationModal'
import { showSuccess, showError } from '../../../components/toast'
import { tagihanSchema, type TagihanFormData, paymentUpdateSchema, type PaymentUpdateFormData } from '../../../schemas/validation'
import { ArrowLeft, Calendar, DollarSign, Edit, Eye, User, Home, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

interface Penyewa {
  id: number
  nama: string
  email?: string
  no_hp?: string
  alamat?: string
  kamar_id: number
  tanggal_masuk: string
  Kamar?: {
    id: number
    nama: string
    harga: number
  }
}

interface Tagihan {
  id: number
  bulan: string
  jumlah: number
  terbayar: number
  status: string
  jenis_tagihan: string
  diterima_oleh?: string
  tanggal_bayar?: string
}

export default function PenyewaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const penyewaId = params.id as string

  const [penyewa, setPenyewa] = useState<Penyewa | null>(null)
  const [tagihan, setTagihan] = useState<Tagihan[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PaymentUpdateFormData>({
    resolver: zodResolver(paymentUpdateSchema),
    defaultValues: {
      status: 'Belum Lunas',
      jumlah: 0,
      jenis_tagihan: 'Penyewa',
      diterima_oleh: '',
      tanggal_bayar: ''
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchPenyewa()
    fetchTagihan()
  }, [penyewaId, selectedYear, router])

  const fetchPenyewa = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:8080/penyewa/${penyewaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPenyewa(response.data)
    } catch (error) {
      console.error('Failed to fetch penyewa', error)
      showError('Gagal memuat data penyewa')
    }
  }

  const fetchTagihan = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:8080/penyewa/${penyewaId}/tagihan?tahun=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTagihan(response.data)
    } catch (error) {
      console.error('Failed to fetch tagihan', error)
      showError('Gagal memuat data tagihan')
    } finally {
      setIsLoading(false)
    }
  }

  const openPaymentModal = (tagihan: Tagihan | null, month?: number) => {
    if (tagihan) {
      setSelectedTagihan(tagihan)
      setValue('status', tagihan.status as 'Lunas' | 'Belum Lunas' | 'Cicil')
      setValue('jumlah', tagihan.terbayar)
      setValue('jenis_tagihan', tagihan.jenis_tagihan)
      setValue('diterima_oleh', tagihan.diterima_oleh || '')
      setValue('tanggal_bayar', tagihan.tanggal_bayar || '')
    } else if (month && penyewa) {
      // Create mode
      const monthStr = `${selectedYear}-${month.toString().padStart(2, '0')}`
      const dummyTagihan: Tagihan = {
        id: 0, // Will be set after creation
        bulan: monthStr,
        jumlah: penyewa.Kamar?.harga || 0,
        terbayar: 0,
        status: 'Belum Lunas',
        jenis_tagihan: 'Penyewa',
        diterima_oleh: '',
        tanggal_bayar: ''
      }
      setSelectedTagihan(dummyTagihan)
      setValue('status', 'Belum Lunas')
      setValue('jumlah', 0)
      setValue('jenis_tagihan', 'Penyewa')
      setValue('diterima_oleh', '')
      setValue('tanggal_bayar', '')
    }
    setShowPaymentModal(true)
  }

  const handlePaymentUpdate = async (data: PaymentUpdateFormData) => {
    if (!selectedTagihan) return

    try {
      const token = localStorage.getItem('token')
      if (selectedTagihan.id === 0) {
        // Create new tagihan
        await axios.post('http://localhost:8080/tagihan', {
          penyewa_id: parseInt(penyewaId),
          kamar_id: penyewa?.kamar_id,
          bulan: selectedTagihan.bulan,
          jumlah: selectedTagihan.jumlah,
          status: data.status,
          terbayar: data.jumlah || 0,
          jenis_tagihan: data.jenis_tagihan,
          diterima_oleh: data.diterima_oleh || '',
          tanggal_bayar: data.tanggal_bayar || ''
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Tagihan berhasil dibuat')
      } else {
        // Update existing tagihan
        await axios.put(`http://localhost:8080/tagihan/${selectedTagihan.id}`, {
          status: data.status,
          terbayar: data.jumlah || 0,
          jenis_tagihan: data.jenis_tagihan,
          diterima_oleh: data.diterima_oleh || '',
          tanggal_bayar: data.tanggal_bayar || ''
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Pembayaran berhasil diperbarui')
      }
      setShowPaymentModal(false)
      setSelectedTagihan(null)
      reset()
      fetchTagihan()
    } catch (error) {
      console.error('Failed to update payment', error)
      showError(selectedTagihan.id === 0 ? 'Gagal membuat tagihan' : 'Gagal memperbarui pembayaran')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lunas': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'Cicil': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
  }

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return months[month - 1]
  }

  const getMonthsToShow = () => {
    if (!penyewa) return []

    const entryDate = new Date(penyewa.tanggal_masuk)
    const entryYear = entryDate.getFullYear()
    const entryMonth = entryDate.getMonth() + 1 // JavaScript months are 0-indexed

    if (selectedYear < entryYear) {
      return [] // No months to show for years before entry
    } else if (selectedYear > entryYear) {
      return Array.from({ length: 12 }, (_, i) => i + 1) // All months for years after entry
    } else {
      // Same year as entry - show months from entry month onwards
      return Array.from({ length: 13 - entryMonth }, (_, i) => entryMonth + i)
    }
  }

  const getTagihanForMonth = (month: number) => {
    const monthStr = `${selectedYear}-${month.toString().padStart(2, '0')}`
    return tagihan.find(t => t.bulan === monthStr)
  }

  const getPenerimaOptions = () => {
    return [
      { value: 'Pengurus Kos', label: 'Pengurus Kos (Saya)' },
      { value: 'Pak Kos', label: 'Pak Kos' },
      { value: 'Lainnya', label: 'Lainnya' }
    ]
  }

  const generateYears = () => {
    if (!penyewa) return []

    const entryDate = new Date(penyewa.tanggal_masuk)
    const entryYear = entryDate.getFullYear()
    const currentYear = new Date().getFullYear()

    const years = []
    for (let i = entryYear; i <= currentYear + 2; i++) {
      years.push(i)
    }
    return years
  }

  if (isLoading && !penyewa) {
    return (
      <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
        <Sidebar />
        <div className="flex-1 p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-border dark:bg-dark-border rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32 bg-border dark:bg-dark-border rounded"></div>
              <div className="h-32 bg-border dark:bg-dark-border rounded"></div>
            </div>
            <div className="h-64 bg-border dark:bg-dark-border rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!penyewa) {
    return (
      <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
        <Sidebar />
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">Penyewa tidak ditemukan</h2>
            <button
              onClick={() => router.push('/penyewa')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-hover"
            >
              Kembali ke Daftar Penyewa
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Sidebar setIsCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-500 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/penyewa')}
              className="p-2 hover:bg-surface dark:hover:bg-dark-surface rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                Detail Penyewa
              </h1>
              <p className="text-text-secondary dark:text-dark-text-secondary">
                Informasi lengkap dan riwayat tagihan {penyewa.nama}
              </p>
            </div>
          </div>

          {/* Penyewa Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border dark:border-dark-border"
            >
              <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Pribadi
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary dark:text-dark-text-secondary">Nama:</span>
                  <span className="font-medium text-text-primary dark:text-dark-text-primary">{penyewa.nama}</span>
                </div>
                {penyewa.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary dark:text-dark-text-secondary">Email:</span>
                    <span className="font-medium text-text-primary dark:text-dark-text-primary">{penyewa.email}</span>
                  </div>
                )}
                {penyewa.no_hp && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary dark:text-dark-text-secondary">No HP:</span>
                    <span className="font-medium text-text-primary dark:text-dark-text-primary">{penyewa.no_hp}</span>
                  </div>
                )}
                {penyewa.alamat && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary dark:text-dark-text-secondary">Alamat:</span>
                    <span className="font-medium text-text-primary dark:text-dark-text-primary">{penyewa.alamat}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary dark:text-dark-text-secondary">Tanggal Masuk:</span>
                  <span className="font-medium text-text-primary dark:text-dark-text-primary">
                    {new Date(penyewa.tanggal_masuk).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border dark:border-dark-border"
            >
              <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Informasi Kamar
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary dark:text-dark-text-secondary">Kamar:</span>
                  <span className="font-medium text-text-primary dark:text-dark-text-primary">
                    {penyewa.Kamar?.nama || 'Kamar tidak ditemukan'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary dark:text-dark-text-secondary">Harga Sewa:</span>
                  <span className="font-medium text-text-primary dark:text-dark-text-primary">
                    Rp {penyewa.Kamar?.harga?.toLocaleString() || '0'}/bulan
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tagihan Tahunan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border dark:border-dark-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Tagihan Tahunan {selectedYear}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedYear(prev => prev - 1)}
                  className="p-2 hover:bg-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg"
                >
                  {generateYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedYear(prev => prev + 1)}
                  className="p-2 hover:bg-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monthly Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {getMonthsToShow().map(month => {
                const tagihanBulan = getTagihanForMonth(month)
                const status = tagihanBulan?.status || 'Belum Lunas'

                return (
                  <motion.button
                    key={month}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: month * 0.02 }}
                    onClick={() => tagihanBulan ? openPaymentModal(tagihanBulan) : openPaymentModal(null, month)}
                    className={`p-3 rounded-lg border transition-all hover:scale-105 ${
                      status === 'Lunas'
                        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                        : status === 'Cicil'
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                    } cursor-pointer`}
                  >
                    <div className="text-center">
                      <div className="font-medium text-sm">{getMonthName(month)}</div>
                      <div className="text-xs mt-1">
                        {tagihanBulan ? `Rp ${tagihanBulan.jumlah.toLocaleString()}` : `Rp ${(penyewa?.Kamar?.harga || 0).toLocaleString()}`}
                      </div>
                      {tagihanBulan?.diterima_oleh && (
                        <div className="text-xs mt-1 text-text-secondary dark:text-dark-text-secondary">
                          Oleh: {tagihanBulan.diterima_oleh}
                        </div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-text-secondary dark:text-dark-text-secondary">Lunas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-text-secondary dark:text-dark-text-secondary">Cicil</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-text-secondary dark:text-dark-text-secondary">Belum Lunas</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTagihan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-surface dark:bg-dark-surface rounded-xl p-6 w-full max-w-md shadow-xl border border-border dark:border-dark-border"
          >
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">
              {selectedTagihan?.id === 0 ? 'Buat Tagihan' : 'Update Pembayaran'} - {getMonthName(parseInt(selectedTagihan.bulan.split('-')[1]))} {selectedYear}
            </h3>

            <form onSubmit={handleSubmit(handlePaymentUpdate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  Status Pembayaran
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Cicil">Cicil</option>
                  <option value="Lunas">Lunas</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  Jumlah Terbayar (Rp)
                </label>
                <input
                  type="number"
                  {...register('jumlah', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
                {errors.jumlah && (
                  <p className="text-red-500 text-xs mt-1">{errors.jumlah.message}</p>
                )}
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                  Total tagihan: Rp {selectedTagihan.jumlah.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  Diterima Oleh
                </label>
                <select
                  {...register('diterima_oleh')}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Pilih penerima...</option>
                  {getPenerimaOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.diterima_oleh && (
                  <p className="text-red-500 text-xs mt-1">{errors.diterima_oleh.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  Tanggal Pembayaran
                </label>
                <input
                  type="date"
                  {...register('tanggal_bayar')}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary"
                />
                {errors.tanggal_bayar && (
                  <p className="text-red-500 text-xs mt-1">{errors.tanggal_bayar.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent hover:bg-hover text-white font-medium py-2 rounded-lg transition-all"
                >
                  {isSubmitting ? 'Menyimpan...' : selectedTagihan?.id === 0 ? 'Buat Tagihan' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedTagihan(null)
                    reset()
                  }}
                  className="flex-1 bg-border dark:bg-dark-border hover:bg-text-secondary text-text-primary dark:text-dark-text-primary font-medium py-2 rounded-lg transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}