import { z } from 'zod'

export const kamarSchema = z.object({
  nama: z.string().min(1, 'Nama kamar wajib diisi').max(50, 'Nama kamar maksimal 50 karakter'),
  harga: z.number().min(0, 'Harga harus positif').max(10000000, 'Harga maksimal 10 juta'),
  status: z.enum(['Tersedia', 'Terisi', 'Perbaikan'])
})

export const penyewaSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  no_hp: z.string().min(10, 'Nomor HP minimal 10 digit').max(15, 'Nomor HP maksimal 15 digit').optional().or(z.literal('')),
  alamat: z.string().min(1, 'Alamat wajib diisi').max(255, 'Alamat maksimal 255 karakter').optional().or(z.literal('')),
  tanggal_masuk: z.string().min(1, 'Tanggal masuk wajib diisi').optional().or(z.literal('')),
  kamar_id: z.number().min(1, 'Kamar wajib dipilih')
})

export const transaksiKeuanganSchema = z.object({
  jenis: z.enum(['pemasukan', 'pengeluaran']),
  kategori: z.string().min(1, 'Kategori wajib diisi').max(50, 'Kategori maksimal 50 karakter'),
  jumlah: z.number().min(0, 'Jumlah harus positif').max(10000000, 'Jumlah maksimal 10 juta'),
  tanggal: z.string().min(1, 'Tanggal wajib diisi')
})

export const tagihanSchema = z.object({
  penyewa_id: z.number().min(1, 'Penyewa wajib dipilih'),
  bulan: z.string().min(1, 'Bulan wajib diisi'),
  jumlah: z.number().min(0, 'Jumlah harus positif').max(10000000, 'Jumlah maksimal 10 juta'),
  terbayar: z.number().min(0, 'Terbayar harus positif').max(10000000, 'Terbayar maksimal 10 juta').optional(),
  jenis_tagihan: z.string().min(1, 'Jenis tagihan wajib diisi').max(50, 'Jenis tagihan maksimal 50 karakter'),
  status: z.enum(['Lunas', 'Belum Lunas', 'Cicil']),
  diterima_oleh: z.string().optional(),
  tanggal_bayar: z.string().optional()
})

export const paymentUpdateSchema = z.object({
  status: z.enum(['Lunas', 'Belum Lunas', 'Cicil']),
  jumlah: z.number().min(0, 'Jumlah terbayar harus positif'),
  jenis_tagihan: z.string().min(1, 'Jenis tagihan wajib diisi'),
  diterima_oleh: z.string().optional(),
  tanggal_bayar: z.string().optional()
}).refine((data) => {
  if (data.status === 'Lunas' || data.status === 'Cicil') {
    return data.diterima_oleh && data.diterima_oleh.trim() !== '' && data.tanggal_bayar && data.tanggal_bayar.trim() !== '';
  }
  return true;
}, {
  message: "Diterima oleh dan tanggal pembayaran wajib diisi untuk status Lunas atau Cicil",
  path: ["status"]
})

export const userSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['admin', 'user'])
})

export type KamarFormData = z.infer<typeof kamarSchema>
export type PenyewaFormData = z.infer<typeof penyewaSchema>
export type TransaksiFormData = z.infer<typeof transaksiKeuanganSchema>
export type TransaksiKeuanganFormData = z.infer<typeof transaksiKeuanganSchema>
export type TagihanFormData = z.infer<typeof tagihanSchema>
export type PaymentUpdateFormData = z.infer<typeof paymentUpdateSchema>
export type UserFormData = z.infer<typeof userSchema>