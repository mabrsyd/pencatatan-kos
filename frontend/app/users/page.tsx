'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface User {
  ID: number
  name: string
  email: string
  role: string
}

export default function UsersPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'penyewa',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const router = useRouter()

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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingUser) {
        await axios.put(`http://localhost:8080/users/${editingUser.ID}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:8080/users', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowForm(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', password: '', role: 'penyewa' })
      fetchUsers()
    } catch (error) {
      console.error('Failed to save user', error)
    }
  }

  const handleEdit = (u: User) => {
    setEditingUser(u)
    setFormData({
      name: u.name,
      email: u.email,
      password: '', // Don't show password
      role: u.role,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:8080/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchUsers()
      } catch (error) {
        console.error('Failed to delete user', error)
      }
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-lilac-dark">Manajemen Users</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark"
            >
              Tambah User
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
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
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Export PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">{editingUser ? 'Edit User' : 'Tambah User'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Nama</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  {!editingUser && (
                    <div>
                      <label className="block text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required={!editingUser}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-gray-700 mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="penyewa">Penyewa</option>
                      <option value="pengelola">Pengelola</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button type="submit" className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark">
                    {editingUser ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingUser(null)
                      setFormData({ name: '', email: '', password: '', role: 'penyewa' })
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-lilac-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.ID}>
                    <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.role === 'admin' ? 'bg-red-100 text-red-800' :
                        u.role === 'pengelola' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(u)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u.ID)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}