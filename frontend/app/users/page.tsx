'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import Sidebar from '../../components/Sidebar'
import ConfirmationModal from '../../components/ConfirmationModal'
import { SkeletonCard } from '../../components/Skeleton'
import { EmptyUsers } from '../../components/EmptyState'
import { showSuccess, showError } from '../../components/toast'
import { userSchema, UserFormData } from '../../schemas/validation'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Users, UserPlus, Shield, Settings, User, Search, Download, Edit, Trash2, Crown, Wrench, X } from 'lucide-react'

interface User {
  ID: number
  name: string
  email: string
  role: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
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
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nama: '',
      email: '',
      password: '',
      role: 'user'
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!token) {
      router.push('/login')
      return
    }
    if (user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchUsers()
  }, [router])

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebarCollapsed')
      setSidebarCollapsed(saved ? JSON.parse(saved) : false)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users', error)
      showError('Gagal memuat data pengguna')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: UserFormData) => {
    try {
      const token = localStorage.getItem('token')
      if (editingUser) {
        await axios.put(`http://localhost:8080/users/${editingUser.ID}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Pengguna berhasil diperbarui')
      } else {
        await axios.post('http://localhost:8080/users', data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        showSuccess('Pengguna berhasil ditambahkan')
      }
      setShowForm(false)
      setEditingUser(null)
      reset()
      fetchUsers()
    } catch (error) {
      console.error('Failed to save user', error)
      showError('Gagal menyimpan pengguna')
    }
  }

  const handleEdit = (u: User) => {
    setEditingUser(u)
    setValue('nama', u.name)
    setValue('email', u.email)
    setValue('password', '') // Don't show password
    setValue('role', u.role as 'admin' | 'user')
    setShowForm(true)
  }

  const handleDelete = (u: User) => {
    setUserToDelete(u)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8080/users/${userToDelete.ID}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess('Pengguna berhasil dihapus')
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user', error)
      showError('Gagal menghapus pengguna')
    } finally {
      setShowDeleteModal(false)
      setUserToDelete(null)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === '' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Users Kos', 20, 10)

    const tableData = filteredUsers.map(u => [
      u.name,
      u.email,
      u.role
    ])

    ;(doc as any).autoTable({
      head: [['Nama', 'Email', 'Role']],
      body: tableData,
      startY: 20,
    })

    doc.save('laporan-users.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(u => ({
      'Nama': u.name,
      'Email': u.email,
      'Role': u.role
    })))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
    XLSX.writeFile(workbook, 'laporan-users.xlsx')
  }

  const adminCount = users.filter(u => u.role === 'admin').length
  const pengelolaCount = users.filter(u => u.role === 'pengelola').length
  const penyewaCount = users.filter(u => u.role === 'penyewa').length

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-5 h-5" />
      case 'pengelola':
        return <Wrench className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'pengelola':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    }
  }

  return (
    <div className="flex min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-4 space-y-4">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                Manajemen Users
              </h1>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Kelola pengguna sistem dengan berbagai peran dan akses
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="group relative inline-flex items-center justify-center px-4 py-2 bg-accent hover:bg-hover text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah User
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Total Users</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">{users.length}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-500 rounded-lg shadow-sm">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Admin</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">{adminCount}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg shadow-sm">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Pengelola</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">{pengelolaCount}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-sm">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary">Penyewa</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary mt-1">{penyewaCount}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-sm">
                    <User className="w-4 h-4 text-white" />
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
                  placeholder="Cari berdasarkan nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary"
                />
              </div>
              <div className="w-full lg:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200 text-text-primary dark:text-dark-text-primary"
                >
                  <option value="">Semua Role</option>
                  <option value="admin">Admin</option>
                  <option value="pengelola">Pengelola</option>
                  <option value="penyewa">Penyewa</option>
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

          {/* Users Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUsers.map((u) => (
              <div key={u.ID} className="group relative bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border dark:border-dark-border hover:scale-102">
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg shadow-sm">
                      {getRoleIcon(u.role)}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h3 className="text-base font-semibold text-text-primary dark:text-dark-text-primary mb-1">{u.name}</h3>
                      <p className="text-text-secondary dark:text-dark-text-secondary text-sm">{u.email}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(u.role)}`}>
                        {getRoleIcon(u.role)}
                        {u.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Belum ada user</h3>
              <p className="text-slate-600 dark:text-slate-400">Tambah user pertama untuk memulai manajemen pengguna.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-primary dark:bg-dark-bg-primary backdrop-blur-xl rounded-xl p-4 w-full max-w-md shadow-xl border border-border dark:border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                {editingUser ? 'Edit User' : 'Tambah User'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingUser(null)
                  reset()
                }}
                className="p-1.5 hover:bg-surface dark:hover:bg-dark-surface rounded-lg transition-colors duration-200 focus-ring"
                aria-label="Tutup form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
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
                <label htmlFor="email" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus-ring"
                  placeholder="user@example.com"
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {!editingUser && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="w-full px-3 py-2 bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-300 text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus-ring"
                    placeholder="Minimal 6 karakter"
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  {errors.password && (
                    <p id="password-error" className="mt-1 text-sm text-red-500" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('role', 'user')}
                    className={`py-3 px-4 rounded-lg font-medium transition-all duration-300 flex flex-col items-center gap-1 ${
                      watch('role') === 'user'
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:border-primary dark:hover:border-dark-primary'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-xs">User</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('role', 'admin')}
                    className={`py-3 px-4 rounded-lg font-medium transition-all duration-300 flex flex-col items-center gap-1 ${
                      watch('role') === 'admin'
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:border-primary dark:hover:border-dark-primary'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                    <span className="text-xs">Admin</span>
                  </button>
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-500" role="alert">
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-hover text-white font-medium py-2 rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  {editingUser ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingUser(null)
                    reset()
                  }}
                  className="flex-1 bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary font-medium py-2 rounded-lg hover:bg-hover dark:hover:bg-dark-hover transition-colors duration-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}