'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface Penyewa {
  ID: number
  nama: string
  kontak: string
  kamar_id: number
  tanggal_masuk: string
}

export default function PenyewaPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [penyewa, setPenyewa] = useState<Penyewa[]>([])
  const [kamar, setKamar] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPenyewa, setEditingPenyewa] = useState<Penyewa | null>(null)
  const [formData, setFormData] = useState({
    nama: '',
    kontak: '',
    kamar_id: 0,
    tanggal_masuk: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

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
      setKamar(response.data.filter((k: any) => k.status === 'Tersedia'))
    } catch (error) {
      console.error('Failed to fetch kamar', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingPenyewa) {
        await axios.put(`http://localhost:8080/penyewa/${editingPenyewa.ID}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('http://localhost:8080/penyewa', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowForm(false)
      setEditingPenyewa(null)
      setFormData({ nama: '', kontak: '', kamar_id: 0, tanggal_masuk: '' })
      fetchPenyewa()
      fetchKamar()
    } catch (error) {
      console.error('Failed to save penyewa', error)
    }
  }

  const handleEdit = (p: Penyewa) => {
    setEditingPenyewa(p)
    setFormData({
      nama: p.nama,
      kontak: p.kontak,
      kamar_id: p.kamar_id,
      tanggal_masuk: p.tanggal_masuk.split('T')[0],
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus penyewa ini?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:8080/penyewa/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchPenyewa()
        fetchKamar()
      } catch (error) {
        console.error('Failed to delete penyewa', error)
      }
    }
  }

  const filteredPenyewa = penyewa.filter(p => {
    const matchesSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.kontak.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Penyewa Kos', 20, 10)
    
    const tableData = filteredPenyewa.map(p => [
      p.nama,
      p.kontak,
      new Date(p.tanggal_masuk).toLocaleDateString('id-ID'),
      kamar.find(k => k.ID === p.kamar_id)?.nama || '-'
    ])

    ;(doc as any).autoTable({
      head: [['Nama Penyewa', 'Kontak', 'Tanggal Masuk', 'Kamar']],
      body: tableData,
      startY: 20,
    })

    doc.save('laporan-penyewa.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPenyewa.map(p => ({
      'Nama Penyewa': p.nama,
      'Kontak': p.kontak,
      'Tanggal Masuk': new Date(p.tanggal_masuk).toLocaleDateString('id-ID'),
      'Kamar': kamar.find(k => k.ID === p.kamar_id)?.nama || '-'
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penyewa')
    XLSX.writeFile(workbook, 'laporan-penyewa.xlsx')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-lilac-dark">Manajemen Penyewa</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark"
            >
              Tambah Penyewa
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari nama penyewa atau kontak..."
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
              <h2 className="text-xl font-semibold mb-4">{editingPenyewa ? 'Edit Penyewa' : 'Tambah Penyewa'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Nama</label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Kontak</label>
                    <input
                      type="text"
                      value={formData.kontak}
                      onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
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
                    <label className="block text-gray-700 mb-2">Tanggal Masuk</label>
                    <input
                      type="date"
                      value={formData.tanggal_masuk}
                      onChange={(e) => setFormData({ ...formData, tanggal_masuk: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button type="submit" className="bg-lilac text-white px-4 py-2 rounded-md hover:bg-lilac-dark">
                    {editingPenyewa ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingPenyewa(null)
                      setFormData({ nama: '', kontak: '', kamar_id: 0, tanggal_masuk: '' })
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Masuk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPenyewa.map((p) => (
                  <tr key={p.ID}>
                    <td className="px-6 py-4 whitespace-nowrap">{p.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{p.kontak}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{kamar.find(k => k.ID === p.kamar_id)?.nama || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(p.tanggal_masuk).toLocaleDateString('id-ID')}</td>
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