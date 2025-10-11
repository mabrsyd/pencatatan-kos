'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface Transaksi {
  ID: number
  jenis: string
  kategori: string
  jumlah: number
  tanggal: string
}

export default function TransaksiPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [transaksi, setTransaksi] = useState<Transaksi[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTransaksi, setEditingTransaksi] = useState<Transaksi | null>(null)
  const [formData, setFormData] = useState({
    jenis: 'pemasukan',
    kategori: '',
    jumlah: 0,
    tanggal: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [jenisFilter, setJenisFilter] = useState('')
  const router = useRouter()

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
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/transaksi', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransaksi(response.data)
    } catch (error) {
      console.error('Failed to fetch transaksi', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingTransaksi) {
        await axios.put(`http://localhost:8080/transaksi/${editingTransaksi.ID}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:8080/transaksi', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowForm(false)
      setEditingTransaksi(null)
      setFormData({ jenis: 'pemasukan', kategori: '', jumlah: 0, tanggal: '' })
      fetchTransaksi()
    } catch (error) {
      console.error('Failed to save transaksi', error)
    }
  }

  const handleEdit = (t: Transaksi) => {
    setEditingTransaksi(t)
    setFormData({
      jenis: t.jenis,
      kategori: t.kategori,
      jumlah: t.jumlah,
      tanggal: t.tanggal.split('T')[0],
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:8080/transaksi/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchTransaksi()
      } catch (error) {
        console.error('Failed to delete transaksi', error)
      }
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-lilac-dark">Manajemen Transaksi</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark"
            >
              Tambah Transaksi
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari berdasarkan kategori atau jenis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={jenisFilter}
                  onChange={(e) => setJenisFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Semua Jenis</option>
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
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
              <h2 className="text-xl font-semibold mb-4">{editingTransaksi ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Jenis</label>
                    <select
                      value={formData.jenis}
                      onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="pemasukan">Pemasukan</option>
                      <option value="pengeluaran">Pengeluaran</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Kategori</label>
                    <input
                      type="text"
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g., Sewa Kamar, WiFi, Listrik"
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
                    {editingTransaksi ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingTransaksi(null)
                      setFormData({ jenis: 'pemasukan', kategori: '', jumlah: 0, tanggal: '' })
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransaksi.map((t) => (
                  <tr key={t.ID}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        t.jenis === 'pemasukan' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{t.kategori}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Rp {t.jumlah.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(t.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.ID)}
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