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
import { EmptyTransaksi } from '../../components/EmptyState'
import { showSuccess, showError, showLoading } from '../../components/toast'
import { transaksiKeuanganSchema, TransaksiKeuanganFormData } from '../../schemas/validation'
import { DataTable } from '../../components/DataTable'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { TrendingUp, TrendingDown, DollarSign, Plus, Search, Download, Edit, Trash2, Calendar, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react'

interface Transaksi {
  id: number
  jenis: string
  kategori: string
  jumlah: number
  tanggal: string
}

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTransaksi, setEditingTransaksi] = useState<Transaksi | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [jenisFilter, setJenisFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transaksiToDelete, setTransaksiToDelete] = useState<Transaksi | null>(null)
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
  } = useForm<TransaksiKeuanganFormData>({
    resolver: zodResolver(transaksiKeuanganSchema),
    defaultValues: {
      jenis: 'pemasukan',
      kategori: '',
      jumlah: 0,
      tanggal: ''
    }
  })

  const watchedJenis = watch('jenis')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchTransaksi()
  }, [router])

  const fetchTransaksi = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/transaksi', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransaksi(response.data)
    } catch (error) {
      console.error('Failed to fetch transaksi', error)
      showError('Gagal memuat data transaksi')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: TransaksiKeuanganFormData) => {
    try {
      const token = localStorage.getItem('token')
      if (editingTransaksi) {
        await axios.put(`http://localhost:8080/transaksi/${editingTransaksi.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Transaksi berhasil diperbarui')
      } else {
        await axios.post('http://localhost:8080/transaksi', data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Transaksi berhasil ditambahkan')
      }
      setShowForm(false)
      setEditingTransaksi(null)
      reset()
      fetchTransaksi()
    } catch (error) {
      console.error('Failed to save transaksi', error)
      showError('Gagal menyimpan transaksi')
    }
  }

  const handleEdit = (t: Transaksi) => {
    setEditingTransaksi(t)
    setValue('jenis', t.jenis as 'pemasukan' | 'pengeluaran')
    setValue('kategori', t.kategori)
    setValue('jumlah', t.jumlah)
    setValue('tanggal', t.tanggal.split('T')[0])
    setShowForm(true)
  }

  const handleDelete = (t: Transaksi) => {
    setTransaksiToDelete(t)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!transaksiToDelete) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8080/transaksi/${transaksiToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess('Transaksi berhasil dihapus')
      fetchTransaksi()
    } catch (error) {
      console.error('Failed to delete transaksi', error)
      showError('Gagal menghapus transaksi')
    } finally {
      setShowDeleteModal(false)
      setTransaksiToDelete(null)
    }
  }

  const filteredTransaksi = transaksi.filter(t => {
    const matchesSearch = t.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.jenis.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesJenis = jenisFilter === '' || t.jenis === jenisFilter
    return matchesSearch && matchesJenis
  })

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Transaksi Kos', 20, 10)

    const tableData = filteredTransaksi.map(t => [
      t.jenis,
      t.kategori,
      `Rp ${t.jumlah.toLocaleString()}`,
      new Date(t.tanggal).toLocaleDateString('id-ID')
    ])

    ;(doc as any).autoTable({
      head: [['Jenis', 'Kategori', 'Jumlah', 'Tanggal']],
      body: tableData,
      startY: 20,
    })

    doc.save('laporan-transaksi.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTransaksi.map(t => ({
      'Jenis': t.jenis,
      'Kategori': t.kategori,
      'Jumlah': t.jumlah,
      'Tanggal': new Date(t.tanggal).toLocaleDateString('id-ID')
    })))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi')
    XLSX.writeFile(workbook, 'laporan-transaksi.xlsx')
  }

  const totalPemasukan = transaksi.filter(t => t.jenis === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0)
  const totalPengeluaran = transaksi.filter(t => t.jenis === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0)
  const saldo = totalPemasukan - totalPengeluaran
  const pemasukanCount = transaksi.filter(t => t.jenis === 'pemasukan').length
  const pengeluaranCount = transaksi.filter(t => t.jenis === 'pengeluaran').length

  return (
    <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Sidebar setIsCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-500 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-4 space-y-4">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                Manajemen Transaksi
              </h1>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Pantau pemasukan dan pengeluaran kos dengan mudah
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="group relative inline-flex items-center justify-center px-4 py-2 bg-accent hover:bg-hover text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Transaksi
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Total Pemasukan</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">Rp {totalPemasukan.toLocaleString()}</p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{pemasukanCount} transaksi</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-sm">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Total Pengeluaran</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">Rp {totalPengeluaran.toLocaleString()}</p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{pengeluaranCount} transaksi</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg shadow-sm">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Saldo Bersih</p>
                    <p className={`text-lg font-bold mt-1 ${saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Rp {saldo.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pemasukan - Pengeluaran</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-sm">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Total Transaksi</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">{transaksi.length}</p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Semua jenis</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-sm">
                    <DollarSign className="w-4 h-4 text-white" />
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
                  placeholder="Cari berdasarkan kategori atau jenis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary"
                />
              </div>
              <div className="w-full lg:w-48">
                <select
                  value={jenisFilter}
                  onChange={(e) => setJenisFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200 text-text-primary dark:text-dark-text-primary"
                >
                  <option value="">Semua Jenis</option>
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportToPDF}
                  className="group relative inline-flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="group relative inline-flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </button>
              </div>
            </div>
          </div>

          {/* Transaksi Table */}
          <DataTable
            columns={[
              {
                key: 'jenis',
                header: 'Jenis',
                render: (value) => {
                  const jenisColors = {
                    'pemasukan': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                    'pengeluaran': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }
                  return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${jenisColors[value as keyof typeof jenisColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
                      {value}
                    </span>
                  )
                }
              },
              {
                key: 'kategori',
                header: 'Kategori',
                render: (value) => (
                  <div className="font-medium text-text-primary dark:text-dark-text-primary">
                    {value}
                  </div>
                )
              },
              {
                key: 'jumlah',
                header: 'Jumlah',
                render: (value, row) => (
                  <span className={`font-semibold ${row.jenis === 'pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {row.jenis === 'pemasukan' ? '+' : '-'}Rp {value.toLocaleString()}
                  </span>
                )
              },
              {
                key: 'tanggal',
                header: 'Tanggal',
                render: (value) => new Date(value).toLocaleDateString('id-ID')
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
            data={filteredTransaksi}
            isLoading={isLoading}
            emptyMessage="Belum ada data transaksi"
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
              setEditingTransaksi(null)
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
            className="bg-surface dark:bg-dark-surface rounded-t-xl sm:rounded-xl p-4 w-full max-w-md shadow-xl border border-border dark:border-dark-border max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                {editingTransaksi ? 'Edit Transaksi' : 'Tambah Transaksi'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingTransaksi(null)
                  reset()
                }}
                className="p-1 hover:bg-border dark:hover:bg-dark-border rounded-lg transition-colors duration-200 focus-ring"
                aria-label="Tutup form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  Jenis Transaksi
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('jenis', 'pemasukan')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 btn-press focus-ring ${
                      watchedJenis === 'pemasukan'
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary hover:bg-hover dark:hover:bg-dark-hover'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4 inline mr-1" />
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('jenis', 'pengeluaran')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 btn-press focus-ring ${
                      watchedJenis === 'pengeluaran'
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary hover:bg-hover dark:hover:bg-dark-hover'
                    }`}
                  >
                    <ArrowDownCircle className="w-4 h-4 inline mr-1" />
                    Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="kategori" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Kategori
                </label>
                <input
                  id="kategori"
                  type="text"
                  {...register('kategori')}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus-ring"
                  placeholder="e.g., Sewa Kamar, WiFi, Listrik"
                  aria-describedby={errors.kategori ? "kategori-error" : undefined}
                />
                {errors.kategori && (
                  <p id="kategori-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.kategori.message}
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

              <div>
                <label htmlFor="tanggal" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Tanggal
                </label>
                <input
                  id="tanggal"
                  type="date"
                  {...register('tanggal')}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary focus-ring"
                  aria-describedby={errors.tanggal ? "tanggal-error" : undefined}
                />
                {errors.tanggal && (
                  <p id="tanggal-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.tanggal.message}
                  </p>
                )}
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
                  {editingTransaksi ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingTransaksi(null)
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
        title="Hapus Transaksi"
        message={`Apakah Anda yakin ingin menghapus transaksi "${transaksiToDelete?.kategori}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  )
}