'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface Tagihan {
  ID: number
  penyewa_id: number
  kamar_id: number
  bulan: string
  jumlah: number
  status: string
  Penyewa?: { nama: string }
  Kamar?: { nama: string }
}

export default function TagihanPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [tagihan, setTagihan] = useState<Tagihan[]>([])
  const [penyewa, setPenyewa] = useState<any[]>([])
  const [kamar, setKamar] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTagihan, setEditingTagihan] = useState<Tagihan | null>(null)
  const [formData, setFormData] = useState({
    penyewa_id: 0,
    kamar_id: 0,
    bulan: '',
    jumlah: 0,
    status: 'Belum Lunas',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [generateMonth, setGenerateMonth] = useState('')
  const router = useRouter()

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

  const fetchTagihan = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/tagihan', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTagihan(response.data)
    } catch (error) {
      console.error('Failed to fetch tagihan', error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingTagihan) {
        await axios.put(`http://localhost:8080/tagihan/${editingTagihan.ID}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:8080/tagihan', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowForm(false)
      setEditingTagihan(null)
      setFormData({ penyewa_id: 0, kamar_id: 0, bulan: '', jumlah: 0, status: 'Belum Lunas' })
      fetchTagihan()
    } catch (error) {
      console.error('Failed to save tagihan', error)
    }
  }

  const handleEdit = (t: Tagihan) => {
    setEditingTagihan(t)
    setFormData({
      penyewa_id: t.penyewa_id,
      kamar_id: t.kamar_id,
      bulan: t.bulan,
      jumlah: t.jumlah,
      status: t.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus tagihan ini?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:8080/tagihan/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchTagihan()
      } catch (error) {
        console.error('Failed to delete tagihan', error)
      }
    }
  }

  const handleGenerateBills = async () => {
    if (!generateMonth) {
      alert('Pilih bulan untuk generate tagihan')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:8080/generate-bills', {
        bulan: generateMonth
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert(`Tagihan berhasil dibuat: ${response.data.createdBills} tagihan baru, ${response.data.skippedBills} dilewati`)
      setGenerateMonth('')
      fetchTagihan()
    } catch (error) {
      console.error('Failed to generate bills', error)
      alert('Gagal generate tagihan')
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
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-lilac-dark">Manajemen Tagihan</h1>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <input
                  type="month"
                  value={generateMonth}
                  onChange={(e) => setGenerateMonth(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                />
                <button
                  onClick={handleGenerateBills}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Generate Tagihan Bulanan
                </button>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark"
              >
                Tambah Tagihan Manual
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama penyewa, kamar, atau bulan..."
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
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                </select>
              </div>
              <div className="flex space-x-2">
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
              <h2 className="text-xl font-semibold mb-4">{editingTagihan ? 'Edit Tagihan' : 'Tambah Tagihan'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Penyewa</label>
                    <select
                      value={formData.penyewa_id}
                      onChange={(e) => setFormData({ ...formData, penyewa_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">Pilih Penyewa</option>
                      {penyewa.map((p) => (
                        <option key={p.ID} value={p.ID}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Kamar</label>
                    <select
                      value={formData.kamar_id}
                      onChange={(e) => setFormData({ ...formData, kamar_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">Pilih Kamar</option>
                      {kamar.map((k) => (
                        <option key={k.ID} value={k.ID}>{k.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Bulan</label>
                    <input
                      type="month"
                      value={formData.bulan}
                      onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
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
                    <label className="block text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Lunas">Lunas</option>
                      <option value="Belum Lunas">Belum Lunas</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button type="submit" className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark">
                    {editingTagihan ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingTagihan(null)
                      setFormData({ penyewa_id: 0, kamar_id: 0, bulan: '', jumlah: 0, status: 'Belum Lunas' })
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penyewa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTagihan.map((t) => (
                  <tr key={t.ID}>
                    <td className="px-6 py-4 whitespace-nowrap">{t.Penyewa?.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{t.Kamar?.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{t.bulan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Rp {t.jumlah.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        t.status === 'Lunas' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
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