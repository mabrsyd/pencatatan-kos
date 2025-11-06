'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import ConfirmationModal from '../../components/ConfirmationModal'
import { SkeletonCard, SkeletonStats } from '../../components/Skeleton'
import { EmptyKamar } from '../../components/EmptyState'
import { showSuccess, showError } from '../../components/toast'
import { kamarSchema, type KamarFormData } from '../../schemas/validation'
import { DataTable } from '../../components/DataTable'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Plus, Search, Filter, Edit, Trash2, Home, DollarSign, Users, CheckCircle, XCircle, Wrench, FileText, FileSpreadsheet, X } from 'lucide-react'

interface Kamar {
  id: number
  nama: string
  harga: number
  status: string
  penyewa_id: number | null
  Penyewa?: { nama: string }
}

export default function KamarPage() {
  const [kamar, setKamar] = useState<Kamar[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingKamar, setEditingKamar] = useState<Kamar | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [kamarToDelete, setKamarToDelete] = useState<Kamar | null>(null)
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
    formState: { errors }
  } = useForm<KamarFormData>({
    resolver: zodResolver(kamarSchema),
    defaultValues: {
      nama: '',
      harga: 0,
      status: 'Tersedia'
    }
  })

  const watchedStatus = watch('status')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchKamar()
  }, [router])

  const fetchKamar = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/kamar', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setKamar(response.data)
    } catch (error) {
      console.error('Failed to fetch kamar', error)
      showError('Gagal memuat data kamar')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: KamarFormData) => {
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')
      if (editingKamar) {
        await axios.put(`http://localhost:8080/kamar/${editingKamar.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Kamar berhasil diperbarui')
      } else {
        await axios.post('http://localhost:8080/kamar', data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Kamar berhasil ditambahkan')
      }
      setShowForm(false)
      setEditingKamar(null)
      reset()
      fetchKamar()
    } catch (error) {
      console.error('Failed to save kamar', error)
      showError('Gagal menyimpan data kamar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (k: Kamar) => {
    setEditingKamar(k)
    setValue('nama', k.nama)
    setValue('harga', k.harga)
    setValue('status', k.status as 'Tersedia' | 'Terisi' | 'Perbaikan')
    setShowForm(true)
  }

  const handleDelete = (kamar: Kamar) => {
    setKamarToDelete(kamar)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!kamarToDelete) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8080/kamar/${kamarToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess('Kamar berhasil dihapus')
      fetchKamar()
    } catch (error) {
      console.error('Failed to delete kamar', error)
      showError('Gagal menghapus kamar')
    } finally {
      setShowDeleteModal(false)
      setKamarToDelete(null)
    }
  }

  const filteredKamar = kamar.filter(k => {
    const matchesSearch = k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         k.Penyewa?.nama.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === '' || k.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Kamar Kos', 20, 10)
    
    const tableData = filteredKamar.map(k => [
      k.nama,
      `Rp ${k.harga.toLocaleString()}`,
      k.status,
      k.Penyewa?.nama || '-'
    ])

    ;(doc as any).autoTable({
      head: [['Nama Kamar', 'Harga', 'Status', 'Penyewa']],
      body: tableData,
      startY: 20,
    })

    doc.save('laporan-kamar.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredKamar.map(k => ({
      'Nama Kamar': k.nama,
      'Harga': k.harga,
      'Status': k.status,
      'Penyewa': k.Penyewa?.nama || '-'
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kamar')
    XLSX.writeFile(workbook, 'laporan-kamar.xlsx')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tersedia': return 'from-green-500 to-emerald-500'
      case 'Terisi': return 'from-blue-500 to-cyan-500'
      case 'Perbaikan': return 'from-orange-500 to-red-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Tersedia': return CheckCircle
      case 'Terisi': return Users
      case 'Perbaikan': return Wrench
      default: return Home
    }
  }

  return (
    <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Sidebar setIsCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 overflow-hidden transition-all duration-500 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-4 overflow-y-auto h-screen animate-in fade-in duration-500">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-1">Manajemen Kamar</h1>
                <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Kelola kamar kos dengan mudah dan efisien</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="group relative inline-flex items-center justify-center px-4 py-2 bg-accent hover:bg-hover text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kamar
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102">
              <div className="relative z-10">
                <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 mb-3 shadow-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Kamar Tersedia</h3>
                <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary">{kamar.filter(k => k.status === 'Tersedia').length}</p>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Siap disewakan</p>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102">
              <div className="relative z-10">
                <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 mb-3 shadow-sm">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Kamar Terisi</h3>
                <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary">{kamar.filter(k => k.status === 'Terisi').length}</p>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Sedang disewa</p>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102">
              <div className="relative z-10">
                <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 mb-3 shadow-sm">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Perbaikan</h3>
                <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary">{kamar.filter(k => k.status === 'Perbaikan').length}</p>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Dalam perbaikan</p>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102">
              <div className="relative z-10">
                <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 mb-3 shadow-sm">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Total Kamar</h3>
                <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary">{kamar.length}</p>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Keseluruhan</p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 border border-border dark:border-dark-border shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-dark-text-secondary" />
                <input
                  type="text"
                  placeholder="Cari nama kamar atau penyewa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-dark-text-secondary" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg text-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 appearance-none"
                  >
                    <option value="">Semua Status</option>
                    <option value="Tersedia">Tersedia</option>
                    <option value="Terisi">Terisi</option>
                    <option value="Perbaikan">Perbaikan</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={exportToPDF}
                    className="group relative inline-flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="group relative inline-flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => {
                setShowForm(false)
                setEditingKamar(null)
                reset()
              }} />

              {/* Modal */}
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-surface dark:bg-dark-surface rounded-t-xl sm:rounded-xl p-4 w-full max-w-md shadow-lg border border-border dark:border-dark-border max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                      {editingKamar ? 'Edit Kamar' : 'Tambah Kamar'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowForm(false)
                        setEditingKamar(null)
                        reset()
                      }}
                      className="p-1 hover:bg-border dark:hover:bg-dark-border rounded-lg transition-colors duration-200 btn-press focus-ring"
                      aria-label="Tutup form"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div>
                    <label htmlFor="nama" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                      Nama Kamar
                    </label>
                    <input
                      id="nama"
                      type="text"
                      {...register('nama')}
                      className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 focus-ring"
                      placeholder="Masukkan nama kamar"
                      aria-describedby={errors.nama ? "nama-error" : undefined}
                    />
                    {errors.nama && (
                      <p id="nama-error" className="mt-1 text-sm text-red-500" role="alert">
                        {errors.nama.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="harga" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                      Harga Sewa
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-dark-text-secondary" />
                      <input
                        id="harga"
                        type="number"
                        {...register('harga', { valueAsNumber: true })}
                        className="w-full pl-10 pr-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 focus-ring"
                        placeholder="0"
                        aria-describedby={errors.harga ? "harga-error" : undefined}
                      />
                      {errors.harga && (
                        <p id="harga-error" className="mt-1 text-sm text-red-500" role="alert">
                          {errors.harga.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                      Status Kamar
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Tersedia', 'Terisi', 'Perbaikan'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setValue('status', status as 'Tersedia' | 'Terisi' | 'Perbaikan')}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                            watchedStatus === status
                              ? `border-${status === 'Tersedia' ? 'green' : status === 'Terisi' ? 'blue' : 'orange'}-500 bg-${status === 'Tersedia' ? 'green' : status === 'Terisi' ? 'blue' : 'orange'}-50 dark:bg-${status === 'Tersedia' ? 'green' : status === 'Terisi' ? 'blue' : 'orange'}-900/20`
                              : 'border-border dark:border-dark-border hover:border-text-secondary dark:hover:border-dark-text-secondary'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            {React.createElement(getStatusIcon(status), {
                              size: 16,
                              className: watchedStatus === status ? 'text-current' : 'text-text-secondary dark:text-dark-text-secondary'
                            })}
                            <span className={`text-xs font-medium ${
                              watchedStatus === status ? 'text-current' : 'text-text-secondary dark:text-dark-text-secondary'
                            }`}>
                              {status}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-500" role="alert">
                        {errors.status.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-accent hover:bg-hover text-white py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-press focus-ring"
                    >
                      {isSubmitting && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {editingKamar ? 'Update' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingKamar(null)
                        reset()
                      }}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-border dark:bg-dark-border hover:bg-text-secondary dark:hover:bg-dark-text-secondary text-text-primary dark:text-dark-text-primary rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 btn-press focus-ring"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
            </>
          )}

          {/* Kamar Table */}
          <DataTable
            columns={[
              {
                key: 'nama',
                header: 'Nama Kamar',
                render: (value) => (
                  <div className="font-medium text-text-primary dark:text-dark-text-primary">
                    {value}
                  </div>
                )
              },
              {
                key: 'harga',
                header: 'Harga',
                render: (value) => `Rp ${value.toLocaleString()}`
              },
              {
                key: 'status',
                header: 'Status',
                render: (value) => {
                  const statusColors = {
                    'Tersedia': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                    'Terisi': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                    'Perbaikan': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                  }
                  return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
                      {value}
                    </span>
                  )
                }
              },
              {
                key: 'Penyewa',
                header: 'Penyewa',
                render: (value) => value?.nama || '-'
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
            data={filteredKamar}
            isLoading={isLoading}
            emptyMessage="Belum ada data kamar"
            itemsPerPage={10}
            showPagination={true}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Hapus Kamar"
        message={`Apakah Anda yakin ingin menghapus kamar "${kamarToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  )
}

