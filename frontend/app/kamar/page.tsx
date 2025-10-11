'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface Kamar {
  ID: number
  nama: string
  harga: number
  status: string
  penyewa_id: number | null
  Penyewa?: { nama: string }
}

export default function KamarPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [kamar, setKamar] = useState<Kamar[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingKamar, setEditingKamar] = useState<Kamar | null>(null)
  const [formData, setFormData] = useState({
    nama: '',
    harga: 0,
    status: 'Tersedia',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const router = useRouter()

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
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/kamar', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setKamar(response.data)
    } catch (error) {
      console.error('Failed to fetch kamar', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingKamar) {
        await axios.put(`http://localhost:8080/kamar/${editingKamar.ID}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:8080/kamar', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowForm(false)
      setEditingKamar(null)
      setFormData({ nama: '', harga: 0, status: 'Tersedia' })
      fetchKamar()
    } catch (error) {
      console.error('Failed to save kamar', error)
    }
  }

  const handleEdit = (k: Kamar) => {
    setEditingKamar(k)
    setFormData({
      nama: k.nama,
      harga: k.harga,
      status: k.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kamar ini?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:8080/kamar/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchKamar()
      } catch (error) {
        console.error('Failed to delete kamar', error)
      }
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-lilac-dark">Manajemen Kamar</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark"
            >
              Tambah Kamar
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari nama kamar atau penyewa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Semua Status</option>
                  <option value="Tersedia">Tersedia</option>
                  <option value="Terisi">Terisi</option>
                  <option value="Perbaikan">Perbaikan</option>
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
              <h2 className="text-xl font-semibold mb-4">{editingKamar ? 'Edit Kamar' : 'Tambah Kamar'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Nama Kamar</label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Harga</label>
                    <input
                      type="number"
                      value={formData.harga}
                      onChange={(e) => setFormData({ ...formData, harga: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Tersedia">Tersedia</option>
                      <option value="Terisi">Terisi</option>
                      <option value="Perbaikan">Perbaikan</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button type="submit" className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark">
                    {editingKamar ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingKamar(null)
                      setFormData({ nama: '', harga: 0, status: 'Tersedia' })
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penyewa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKamar.map((k) => (
                  <tr key={k.ID}>
                    <td className="px-6 py-4 whitespace-nowrap">{k.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Rp {k.harga.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        k.status === 'Tersedia' ? 'bg-green-100 text-green-800' :
                        k.status === 'Terisi' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{k.Penyewa?.nama || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(k)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(k.ID)}
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