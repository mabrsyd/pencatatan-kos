'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import ConfirmationModal from '../../components/ConfirmationModal'
import { SkeletonCard } from '../../components/Skeleton'
import { EmptyPenyewa } from '../../components/EmptyState'
import { showSuccess, showError } from '../../components/toast'
import { penyewaSchema, type PenyewaFormData } from '../../schemas/validation'
import { DataTable } from '../../components/DataTable'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Users, UserPlus, Search, Download, Edit, Trash2, Calendar, Phone, Home, Mail, MapPin, X, Eye } from 'lucide-react'

interface Penyewa {
  ID: number
  nama: string
  email?: string
  no_hp?: string
  alamat?: string
  kamar_id: number
  tanggal_masuk: string
  tagihan_preview?: { [key: string]: string }
}

export default function PenyewaPage() {
  const [penyewa, setPenyewa] = useState<Penyewa[]>([])
  const [kamar, setKamar] = useState<any[]>([])
  const [kamarTersedia, setKamarTersedia] = useState<any[]>([])
  // const [kamarTersedia, setKamarTersedia] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPenyewa, setEditingPenyewa] = useState<Penyewa | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [penyewaToDelete, setPenyewaToDelete] = useState<Penyewa | null>(null)
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
    formState: { errors }
  } = useForm<PenyewaFormData>({
    resolver: zodResolver(penyewaSchema),
    defaultValues: {
      nama: '',
      email: '',
      no_hp: '',
      alamat: '',
      tanggal_masuk: '',
      kamar_id: 0
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchPenyewa()
    fetchKamar()
  }, [router])

  const fetchPenyewa = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/penyewa', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPenyewa(response.data)
    } catch (error) {
      console.error('Failed to fetch penyewa', error)
      showError('Gagal memuat data penyewa')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchKamar = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/kamar', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setKamar(response.data)
      setKamarTersedia(response.data.filter((k: any) => k.status === 'Tersedia'))
    } catch (error) {
      console.error('Failed to fetch kamar', error)
    }
  }

  const onSubmit = async (data: PenyewaFormData) => {
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')
      if (editingPenyewa) {
        await axios.put(`http://localhost:8080/penyewa/${editingPenyewa.ID}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Penyewa berhasil diperbarui')
      } else {
        await axios.post('http://localhost:8080/penyewa', data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Penyewa berhasil ditambahkan')
      }
      setShowForm(false)
      setEditingPenyewa(null)
      reset()
      fetchPenyewa()
      fetchKamar()
    } catch (error) {
      console.error('Failed to save penyewa', error)
      showError('Gagal menyimpan data penyewa')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (p: Penyewa) => {
    setEditingPenyewa(p)
    setValue('nama', p.nama)
    setValue('email', p.email || '')
    setValue('no_hp', p.no_hp || '')
    setValue('alamat', p.alamat || '')
    setValue('tanggal_masuk', p.tanggal_masuk)
    setValue('kamar_id', p.kamar_id)
    setShowForm(true)
  }

  const handleDelete = (penyewa: Penyewa) => {
    setPenyewaToDelete(penyewa)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!penyewaToDelete) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8080/penyewa/${penyewaToDelete.ID}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess('Penyewa berhasil dihapus')
      fetchPenyewa()
      fetchKamar()
    } catch (error) {
      console.error('Failed to delete penyewa', error)
      showError('Gagal menghapus penyewa')
    } finally {
      setShowDeleteModal(false)
      setPenyewaToDelete(null)
    }
  }

  const filteredPenyewa = penyewa.filter(p => {
    const matchesSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.no_hp?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Penyewa Kos', 20, 10)

    const tableData = filteredPenyewa.map(p => [
      p.nama,
      p.no_hp || '',
      new Date(p.tanggal_masuk).toLocaleDateString('id-ID'),
      kamar.find(k => k.ID === p.kamar_id)?.nama || '-'
    ])

    ;(doc as any).autoTable({
      head: [['Nama Penyewa', 'No HP', 'Tanggal Masuk', 'Kamar']],
      body: tableData,
      startY: 20,
    })

    doc.save('laporan-penyewa.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPenyewa.map(p => ({
      'Nama Penyewa': p.nama,
      'No HP': p.no_hp || '',
      'Tanggal Masuk': new Date(p.tanggal_masuk).toLocaleDateString('id-ID'),
      'Kamar': kamar.find(k => k.ID === p.kamar_id)?.nama || '-'
    })))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penyewa')
    XLSX.writeFile(workbook, 'laporan-penyewa.xlsx')
  }

  return (
    <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Sidebar setIsCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-500 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-4 space-y-4">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                Manajemen Penyewa
              </h1>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Kelola data penyewa kos dengan mudah dan efisien
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="group relative inline-flex items-center justify-center px-4 py-2 bg-accent hover:bg-hover text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah Penyewa
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Total Penyewa</p>
                    <p className="text-xl font-bold text-text-primary dark:text-dark-text-primary mt-1">{penyewa.length}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-sm">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Kamar Tersedia</p>
                    <p className="text-xl font-bold text-text-primary dark:text-dark-text-primary mt-1">{kamarTersedia.length}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-sm">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Kamar Terisi</p>
                    <p className="text-xl font-bold text-text-primary dark:text-dark-text-primary mt-1">{penyewa.length}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-sm">
                    <UserPlus className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Export Section */}
          <div className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm border border-border dark:border-dark-border">
            <div className="flex flex-col lg:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-dark-text-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama penyewa atau nomor HP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary"
                />
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
                  className="group relative inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Penyewa Table */}
          <DataTable
            columns={[
              {
                key: 'nama',
                header: 'Nama',
                render: (value) => (
                  <div className="font-medium text-text-primary dark:text-dark-text-primary">
                    {value}
                  </div>
                )
              },
              {
                key: 'email',
                header: 'Email',
                render: (value) => value || '-'
              },
              {
                key: 'no_hp',
                header: 'No HP',
                render: (value) => value || '-'
              },
              {
                key: 'kamar_id',
                header: 'Kamar',
                render: (value) => kamar.find(k => k.ID === value)?.nama || 'Kamar tidak ditemukan'
              },
              {
                key: 'tanggal_masuk',
                header: 'Tanggal Masuk',
                render: (value) => new Date(value).toLocaleDateString('id-ID')
              },
              {
                key: 'tagihan_preview',
                header: 'Tagihan 3 Bulan',
                render: (value, row) => {
                  // Calculate last 3 months in Jakarta timezone
                  // Show: previous month, current month, next month
                  const jakartaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
                  const jakartaDate = new Date(jakartaTime)
                  
                  const months = []
                  for (let i = -1; i <= 1; i++) {
                    const date = new Date(jakartaDate)
                    date.setMonth(jakartaDate.getMonth() + i)
                    const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
                    const monthName = date.toLocaleDateString('id-ID', { month: 'short' })
                    months.push({ key: monthKey, name: monthName })
                  }

                  return (
                    <div className="flex gap-1">
                      {months.map((month) => {
                        const status = row.tagihan_preview?.[month.key] || 'Tidak Ada'
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case 'Lunas':
                              return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            case 'Belum Lunas':
                              return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            case 'Cicil':
                              return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            default:
                              return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }
                        }
                        
                        return (
                          <div
                            key={month.key}
                            className={`w-8 h-6 rounded text-xs flex items-center justify-center font-medium ${getStatusColor(status)}`}
                            title={`${month.name} ${month.key.split('-')[0]}: ${status}`}
                          >
                            {month.name}
                          </div>
                        )
                      })}
                    </div>
                  )
                }
              },
              {
                key: 'actions',
                header: 'Aksi',
                render: (_, row) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/penyewa/${row.ID}`)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md transition-colors duration-200"
                      title="Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
            data={filteredPenyewa}
            isLoading={isLoading}
            emptyMessage="Belum ada data penyewa"
            itemsPerPage={10}
            showPagination={true}
            onRowClick={(row) => router.push(`/penyewa/${row.ID}`)}
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
              setEditingPenyewa(null)
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
                {editingPenyewa ? 'Edit Penyewa' : 'Tambah Penyewa'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingPenyewa(null)
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
                <label htmlFor="nama" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Nama Lengkap
                </label>
                <input
                  id="nama"
                  type="text"
                  {...register('nama')}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus-ring"
                  placeholder="Masukkan nama lengkap"
                  aria-describedby={errors.nama ? "nama-error" : undefined}
                />
                {errors.nama && (
                  <p id="nama-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.nama.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus-ring"
                  placeholder="Masukkan alamat email"
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="no_hp" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Nomor HP
                </label>
                <input
                  id="no_hp"
                  type="tel"
                  {...register('no_hp')}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus-ring"
                  placeholder="Masukkan nomor HP"
                  aria-describedby={errors.no_hp ? "no_hp-error" : undefined}
                />
                {errors.no_hp && (
                  <p id="no_hp-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.no_hp.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="alamat" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Alamat
                </label>
                <textarea
                  id="alamat"
                  {...register('alamat')}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus-ring resize-none"
                  placeholder="Masukkan alamat lengkap"
                  aria-describedby={errors.alamat ? "alamat-error" : undefined}
                />
                {errors.alamat && (
                  <p id="alamat-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.alamat.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="kamar_id" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Kamar
                </label>
                <select
                  id="kamar_id"
                  {...register('kamar_id', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary focus-ring"
                  aria-describedby={errors.kamar_id ? "kamar-error" : undefined}
                >
                  <option value="">Pilih Kamar</option>
                  {kamarTersedia.map((k) => (
                    <option key={k.ID} value={k.ID}>{k.nama}</option>
                  ))}
                </select>
                {errors.kamar_id && (
                  <p id="kamar-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.kamar_id.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="tanggal_masuk" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                  Tanggal Masuk
                </label>
                <input
                  id="tanggal_masuk"
                  type="date"
                  {...register('tanggal_masuk')}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary focus-ring"
                  aria-describedby={errors.tanggal_masuk ? "tanggal-error" : undefined}
                />
                {errors.tanggal_masuk && (
                  <p id="tanggal-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.tanggal_masuk.message}
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
                  {editingPenyewa ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingPenyewa(null)
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
        title="Hapus Penyewa"
        message={`Apakah Anda yakin ingin menghapus penyewa "${penyewaToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  )
}