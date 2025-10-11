'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface Pengeluaran {
  ID: number
  kategori: string
  jumlah: number
  keterangan: string
  tanggal: string
}

export default function PengeluaranPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [pengeluaran, setPengeluaran] = useState<Pengeluaran[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPengeluaran, setEditingPengeluaran] = useState<Pengeluaran | null>(null)
  const [formData, setFormData] = useState({
    kategori: '',
    jumlah: 0,
    keterangan: '',
    tanggal: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchPengeluaran()
  }, [router])

  const fetchPengeluaran = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/pengeluaran', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPengeluaran(response.data)
    } catch (error) {
      console.error('Failed to fetch pengeluaran', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingPengeluaran) {
        await axios.put(`http://localhost:8080/pengeluaran/${editingPengeluaran.ID}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:8080/pengeluaran', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowForm(false)
      setEditingPengeluaran(null)
      setFormData({ kategori: '', jumlah: 0, keterangan: '', tanggal: '' })
      fetchPengeluaran()
    } catch (error) {
      console.error('Failed to save pengeluaran', error)
    }
  }

  const handleEdit = (p: Pengeluaran) => {
    setEditingPengeluaran(p)
    setFormData({
      kategori: p.kategori,
      jumlah: p.jumlah,
      keterangan: p.keterangan,
      tanggal: p.tanggal.split('T')[0],
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:8080/pengeluaran/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchPengeluaran()
      } catch (error) {
        console.error('Failed to delete pengeluaran', error)
      }
    }
  }

  const filteredPengeluaran = pengeluaran.filter(p => {
    return p.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Pengeluaran Kos', 20, 10)
    
    const tableData = filteredPengeluaran.map(p => [
      p.kategori,
      `Rp ${p.jumlah.toLocaleString()}`,
      p.keterangan,
      new Date(p.tanggal).toLocaleDateString('id-ID')
    ])

    ;(doc as any).autoTable({
      head: [['Kategori', 'Jumlah', 'Keterangan', 'Tanggal']],
      body: tableData,
      startY: 20,
    })

    doc.save('laporan-pengeluaran.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPengeluaran.map(p => ({
      'Kategori': p.kategori,
      'Jumlah': p.jumlah,
      'Keterangan': p.keterangan,
      'Tanggal': new Date(p.tanggal).toLocaleDateString('id-ID')
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pengeluaran')
    XLSX.writeFile(workbook, 'laporan-pengeluaran.xlsx')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-lilac-dark">Manajemen Pengeluaran</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark"
            >
              Tambah Pengeluaran
            </button>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari berdasarkan kategori atau keterangan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
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
              <h2 className="text-xl font-semibold mb-4">{editingPengeluaran ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Kategori</label>
                    <input
                      type="text"
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g., WiFi, Listrik, Air"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Jumlah</label>
                    <input
                      type="number"
                      value={formData.jumlah}
                      onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Keterangan</label>
                    <textarea
                      value={formData.keterangan}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                      placeholder="Deskripsi pengeluaran..."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Tanggal</label>
                    <input
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button type="submit" className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark">
                    {editingPengeluaran ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingPengeluaran(null)
                      setFormData({ kategori: '', jumlah: 0, keterangan: '', tanggal: '' })
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPengeluaran.map((p) => (
                  <tr key={p.ID}>
                    <td className="px-6 py-4 whitespace-nowrap">{p.kategori}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Rp {p.jumlah.toLocaleString()}</td>
                    <td className="px-6 py-4">{p.keterangan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.ID)}
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