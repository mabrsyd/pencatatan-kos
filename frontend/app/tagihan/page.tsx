'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import Sidebar from '../../components/Sidebar'
import ConfirmationModal from '../../components/ConfirmationModal'
import { SkeletonCard, SkeletonTable } from '../../components/Skeleton'
import { EmptyTagihan } from '../../components/EmptyState'
import { showSuccess, showError, showLoading } from '../../components/toast'
import { tagihanSchema, TagihanFormData } from '../../schemas/validation'
import { DataTable } from '../../components/DataTable'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Receipt, DollarSign, CheckCircle, XCircle, Plus, Search, Download, Edit, Trash2, Calendar, User, Home, Zap, Clock } from 'lucide-react'

interface Tagihan {
  ID: number
  penyewa_id: number
  kamar_id: number
  bulan: string
  jumlah: number
  terbayar: number
  status: string
  jenis_tagihan: string
  Penyewa?: { nama: string }
  Kamar?: { nama: string }
}

export default function TagihanPage() {
  const [tagihan, setTagihan] = useState<Tagihan[]>([])
  const [penyewa, setPenyewa] = useState<any[]>([])
  const [kamar, setKamar] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTagihan, setEditingTagihan] = useState<Tagihan | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tahunFilter, setTahunFilter] = useState(new Date().getFullYear().toString())
  const [bulanFilter, setBulanFilter] = useState('')
  const [jenisTagihanFilter, setJenisTagihanFilter] = useState('')
  const [generateMonth, setGenerateMonth] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tagihanToDelete, setTagihanToDelete] = useState<Tagihan | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TagihanFormData>({
    resolver: zodResolver(tagihanSchema),
    defaultValues: {
      penyewa_id: 0,
      kamar_id: 0,
      bulan: '',
      jumlah: 0,
      jenis_tagihan: '',
      status: 'Belum Lunas'
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchTagihan()
    fetchPenyewa()
    fetchKamar()
  }, [router])

  // Auto-fill kamar_id when penyewa_id changes
  useEffect(() => {
    const selectedPenyewaId = watch('penyewa_id')
    if (selectedPenyewaId && penyewa.length > 0) {
      const selectedPenyewa = penyewa.find(p => p.ID === selectedPenyewaId)
      if (selectedPenyewa) {
        setValue('kamar_id', selectedPenyewa.kamar_id)
      }
    }
  }, [watch('penyewa_id'), penyewa, setValue])

  const fetchTagihan = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/tagihan', {
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

  const fetchPenyewa = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/penyewa', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPenyewa(response.data)
    } catch (error) {
      console.error('Failed to fetch penyewa', error)
    }
  }

  const fetchKamar = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/kamar', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setKamar(response.data)
    } catch (error) {
      console.error('Failed to fetch kamar', error)
    }
  }

  const onSubmit = async (data: TagihanFormData) => {
    try {
      const token = localStorage.getItem('token')
      if (editingTagihan) {
        await axios.put(`http://localhost:8080/tagihan/${editingTagihan.ID}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Tagihan berhasil diperbarui')
      } else {
        await axios.post('http://localhost:8080/tagihan', data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Tagihan berhasil ditambahkan')
      }
      setShowForm(false)
      setEditingTagihan(null)
      reset()
      fetchTagihan()
    } catch (error) {
      console.error('Failed to save tagihan', error)
      showError('Gagal menyimpan tagihan')
    }
  }

  const handleEdit = (t: Tagihan) => {
    setEditingTagihan(t)
    setValue('penyewa_id', t.penyewa_id)
    setValue('kamar_id', t.kamar_id)
    setValue('bulan', t.bulan)
    setValue('jumlah', t.jumlah)
    setValue('jenis_tagihan', t.jenis_tagihan)
    setValue('status', t.status as 'Lunas' | 'Belum Lunas' | 'Cicil')
    setShowForm(true)
  }

  const handleDelete = (t: Tagihan) => {
    setTagihanToDelete(t)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!tagihanToDelete) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8080/tagihan/${tagihanToDelete.ID}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess('Tagihan berhasil dihapus')
      fetchTagihan()
    } catch (error) {
      console.error('Failed to delete tagihan', error)
      showError('Gagal menghapus tagihan')
    } finally {
      setShowDeleteModal(false)
      setTagihanToDelete(null)
    }
  }

  const handleGenerateBills = async () => {
    if (!generateMonth) {
      showError('Pilih bulan untuk generate tagihan')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:8080/generate-bills', {
        bulan: generateMonth
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess(`Tagihan berhasil dibuat: ${response.data.createdBills} tagihan baru, ${response.data.skippedBills} dilewati`)
      setGenerateMonth('')
      fetchTagihan()
    } catch (error) {
      console.error('Failed to generate bills', error)
      showError('Gagal generate tagihan')
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Tagihan Kos', 20, 10)

    const tableData = filteredTagihan.map(t => [
      t.Penyewa?.nama || '',
      t.Kamar?.nama || '',
      t.bulan,
      `Rp ${t.jumlah.toLocaleString()}`,
      t.status
    ])

    ;(doc as any).autoTable({
      head: [['Penyewa', 'Kamar', 'Bulan', 'Jumlah', 'Status']],
      body: tableData,
      startY: 20,
    })

    doc.save('laporan-tagihan.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTagihan.map(t => ({
      'Penyewa': t.Penyewa?.nama || '',
      'Kamar': t.Kamar?.nama || '',
      'Bulan': t.bulan,
      'Jumlah': t.jumlah,
      'Status': t.status
    })))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tagihan')
    XLSX.writeFile(workbook, 'laporan-tagihan.xlsx')
  }

  const filteredTagihan = tagihan.filter(t => {
    const matchesSearch = t.Penyewa?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.Kamar?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.bulan.includes(searchTerm)
    const matchesStatus = statusFilter === '' || t.status === statusFilter
    const matchesTahun = tahunFilter === '' || t.bulan.includes(tahunFilter)
    const matchesBulan = bulanFilter === '' || t.bulan.includes(bulanFilter)
    const matchesJenis = jenisTagihanFilter === '' || t.jenis_tagihan === jenisTagihanFilter
    return matchesSearch && matchesStatus && matchesTahun && matchesBulan && matchesJenis
  })

  const totalTagihan = tagihan.reduce((sum, t) => sum + t.jumlah, 0)
  const lunasCount = tagihan.filter(t => t.status === 'Lunas').length
  const belumLunasCount = tagihan.filter(t => t.status === 'Belum Lunas').length
  const lunasAmount = tagihan.filter(t => t.status === 'Lunas').reduce((sum, t) => sum + t.jumlah, 0)
  const belumLunasAmount = tagihan.filter(t => t.status === 'Belum Lunas').reduce((sum, t) => sum + t.jumlah, 0)

  return (
    <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Sidebar setIsCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-500 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-4 space-y-4">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                Manajemen Tagihan
              </h1>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Kelola tagihan kos dengan mudah dan efisien
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Generate Bills Section */}
              <div className="flex items-center gap-2 bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-lg p-2 shadow-sm border border-border dark:border-dark-border">
                <Calendar className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary" />
                <input
                  type="month"
                  value={generateMonth}
                  onChange={(e) => setGenerateMonth(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-text-primary dark:text-dark-text-primary"
                />
                <button
                  onClick={handleGenerateBills}
                  className="bg-accent hover:bg-hover text-white px-3 py-1.5 rounded text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 btn-press focus-ring"
                >
                  Generate
                </button>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="group relative inline-flex items-center justify-center px-4 py-2 bg-accent hover:bg-hover text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 btn-press focus-ring"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tagihan
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Total Tagihan</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">Rp {totalTagihan.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-sm">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Lunas</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">{lunasCount}</p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Rp {lunasAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Belum Lunas</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">{belumLunasCount}</p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Rp {belumLunasAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg shadow-sm">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Cicil</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">{tagihan.filter(t => t.status === 'Cicil').length}</p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Rp {tagihan.filter(t => t.status === 'Cicil').reduce((sum, t) => sum + t.jumlah, 0).toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-sm">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Total Item</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">{tagihan.length}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-sm">
                    <Receipt className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm border border-border dark:border-dark-border">
            <div className="flex flex-col lg:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-dark-text-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama penyewa, kamar, atau bulan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={tahunFilter}
                  onChange={(e) => setTahunFilter(e.target.value)}
                  className="px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200 text-text-primary dark:text-dark-text-primary text-sm"
                >
                  <option value="">Semua Tahun</option>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
                <select
                  value={bulanFilter}
                  onChange={(e) => setBulanFilter(e.target.value)}
                  className="px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200 text-text-primary dark:text-dark-text-primary text-sm"
                >
                  <option value="">Semua Bulan</option>
                  {[
                    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                  ].map((bulan, index) => (
                    <option key={index + 1} value={bulan}>{bulan}</option>
                  ))}
                </select>
                <select
                  value={jenisTagihanFilter}
                  onChange={(e) => setJenisTagihanFilter(e.target.value)}
                  className="px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200 text-text-primary dark:text-dark-text-primary text-sm"
                >
                  <option value="">Semua Jenis</option>
                  <option value="Sewa Bulanan">Sewa Bulanan</option>
                  <option value="Listrik">Listrik</option>
                  <option value="Air">Air</option>
                  <option value="Kebersihan">Kebersihan</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200 text-text-primary dark:text-dark-text-primary text-sm"
                >
                  <option value="">Semua Status</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Cicil">Cicil</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportToPDF}
                  className="group relative inline-flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 btn-press focus-ring"
                  aria-label="Export ke PDF"
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="group relative inline-flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 btn-press focus-ring"
                  aria-label="Export ke Excel"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </button>
              </div>
            </div>
          </div>

          {/* Tagihan Table */}
          <DataTable
            columns={[
              {
                key: 'Penyewa',
                header: 'Penyewa',
                render: (value) => value?.nama || '-'
              },
              {
                key: 'Kamar',
                header: 'Kamar',
                render: (value) => value?.nama || '-'
              },
              {
                key: 'bulan',
                header: 'Bulan',
                render: (value) => value
              },
              {
                key: 'jumlah',
                header: 'Jumlah',
                render: (value) => `Rp ${value.toLocaleString()}`
              },
              {
                key: 'terbayar',
                header: 'Terbayar',
                render: (value) => `Rp ${value.toLocaleString()}`
              },
              {
                key: 'status',
                header: 'Status',
                render: (value) => {
                  const statusColors = {
                    'Lunas': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                    'Belum Lunas': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                    'Cicil': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }
                  return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
                      {value}
                    </span>
                  )
                }
              },
              {
                key: 'actions',
                header: 'Aksi',
                render: (_, row) => (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(row)
                      }}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md transition-colors duration-200"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(row)
                      }}
                      className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md transition-colors duration-200"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              }
            ]}
            data={filteredTagihan}
            isLoading={isLoading}
            emptyMessage="Belum ada data tagihan"
            itemsPerPage={10}
            showPagination={true}
          />
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false)
              setEditingTagihan(null)
              reset()
            }
          }}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
            className="bg-surface dark:bg-dark-surface rounded-t-xl sm:rounded-xl p-4 w-full max-w-2xl shadow-xl border border-border dark:border-dark-border max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                {editingTagihan ? 'Edit Tagihan' : 'Tambah Tagihan'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingTagihan(null)
                  reset()
                }}
                className="p-1 hover:bg-border dark:hover:bg-dark-border rounded-lg transition-colors duration-200 focus-ring"
                aria-label="Tutup form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="penyewa_id" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                    Penyewa
                  </label>
                  <select
                    id="penyewa_id"
                    {...register('penyewa_id', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary focus-ring"
                    aria-describedby={errors.penyewa_id ? "penyewa-error" : undefined}
                  >
                    <option value="">Pilih Penyewa</option>
                    {penyewa.map((p) => (
                      <option key={p.ID} value={p.ID}>{p.nama}</option>
                    ))}
                  </select>
                  {errors.penyewa_id && (
                    <p id="penyewa-error" className="mt-1 text-sm text-red-500" role="alert">
                      {errors.penyewa_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="bulan" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                    Bulan
                  </label>
                  <input
                    id="bulan"
                    type="month"
                    {...register('bulan')}
                    className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary focus-ring"
                    aria-describedby={errors.bulan ? "bulan-error" : undefined}
                  />
                  {errors.bulan && (
                    <p id="bulan-error" className="mt-1 text-sm text-red-500" role="alert">
                      {errors.bulan.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="jenis_tagihan" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                    Jenis Tagihan
                  </label>
                  <input
                    id="jenis_tagihan"
                    type="text"
                    {...register('jenis_tagihan')}
                    className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus-ring"
                    placeholder="e.g., Sewa Bulanan, Listrik"
                    aria-describedby={errors.jenis_tagihan ? "jenis-error" : undefined}
                  />
                  {errors.jenis_tagihan && (
                    <p id="jenis-error" className="mt-1 text-sm text-red-500" role="alert">
                      {errors.jenis_tagihan.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="jumlah" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                    Jumlah (Rp)
                  </label>
                  <input
                    id="jumlah"
                    type="number"
                    {...register('jumlah', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus-ring"
                    placeholder="0"
                    aria-describedby={errors.jumlah ? "jumlah-error" : undefined}
                  />
                  {errors.jumlah && (
                    <p id="jumlah-error" className="mt-1 text-sm text-red-500" role="alert">
                      {errors.jumlah.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  Status Pembayaran
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('status', 'Lunas')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 btn-press focus-ring ${
                      watch('status') === 'Lunas'
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary hover:bg-hover dark:hover:bg-dark-hover'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Lunas
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('status', 'Belum Lunas')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 btn-press focus-ring ${
                      watch('status') === 'Belum Lunas'
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary hover:bg-hover dark:hover:bg-dark-hover'
                    }`}
                  >
                    <XCircle className="w-4 h-4 inline mr-1" />
                    Belum Lunas
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('status', 'Cicil')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 btn-press focus-ring ${
                      watch('status') === 'Cicil'
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary hover:bg-hover dark:hover:bg-dark-hover'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    Cicil
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent hover:bg-hover text-white font-medium py-2 rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-press focus-ring"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {editingTagihan ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingTagihan(null)
                    reset()
                  }}
                  disabled={isSubmitting}
                  className="flex-1 bg-border dark:bg-dark-border hover:bg-text-secondary dark:hover:bg-dark-text-secondary text-text-primary dark:text-dark-text-primary font-medium py-2 rounded-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 btn-press focus-ring"
                >
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Hapus Tagihan"
        message={`Apakah Anda yakin ingin menghapus tagihan untuk "${tagihanToDelete?.Penyewa?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  )
}