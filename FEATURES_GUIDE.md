# 📚 Features Guide - Kos Muhandis

Dokumentasi lengkap semua fitur sistem manajemen kos.

## 📑 Table of Contents

1. [Dashboard](#dashboard)
2. [Properti Management](#properti-management)
3. [Penghuni Management](#penghuni-management)
4. [Keuangan Management](#keuangan-management)
5. [Sistem Notifikasi](#sistem-notifikasi-new)
6. [Laporan & Analytics](#laporan--analytics-new)
7. [WhatsApp Integration](#whatsapp-integration-new)
8. [User Management](#user-management)

---

## Dashboard

Halaman utama dengan overview komprehensif dari sistem kos.

### Komponen Utama

1. **Statistics Cards**

   - Total Kamar
   - Total Penghuni
   - Total Tagihan (bulan ini)
   - Total Transaksi

2. **Charts**

   - Bar Chart: Revenue vs Expense (bulanan)
   - Pie Chart: Occupancy Status
   - Line Chart: Monthly Trend

3. **Recent Activities**

   - Daftar penyewa baru
   - Transaksi terbaru
   - Perubahan status kamar

4. **Quick Actions**
   - Tambah Kamar
   - Tambah Penghuni
   - Buat Tagihan
   - Lihat Laporan

### Notification Alert

- Notifikasi jatuh tempo pembayaran
- Kamar yang kosong
- Maintenance alerts

---

## Properti Management

### Kamar (Room Management)

**Menu**: Sidebar → Properti → Kamar

#### Fitur CRUD

- ✅ Tambah Kamar Baru

  - Nomor kamar (unique)
  - Tipe kamar (VIP/Standard)
  - Harga per bulan
  - Deskripsi
  - Foto/image (optional)

- ✅ Edit Kamar

  - Update semua informasi
  - Change harga
  - Update status

- ✅ Hapus Kamar

  - Konfirmasi sebelum delete
  - Cascade delete transaksi terkait (optional)

- ✅ View Detail Kamar
  - Informasi kamar lengkap
  - Penyewa yang menghuni
  - Riwayat transaksi

#### Status Kamar

- **Kosong** (Available)
- **Terisi** (Occupied)
- **Maintenance** (Under Maintenance)
- **Reserved** (Reserved)

#### Filter & Search

- Filter by status
- Filter by tipe kamar
- Search by nomor kamar
- Sort by harga/nomor

---

## Penghuni Management

### Penyewa (Tenant Management)

**Menu**: Sidebar → Penghuni → Daftar Penghuni

#### Fitur CRUD

- ✅ Tambah Penyewa

  - Nama lengkap
  - Email
  - Nomor telepon (WhatsApp)
  - Nomor KTP/ID
  - Alamat asal
  - Tanggal check-in
  - Pilih kamar

- ✅ Edit Penyewa

  - Update informasi personal
  - Change kamar (jika kosong)
  - Update kontak

- ✅ Hapus Penyewa

  - Set check-out date
  - Konfirmasi final settlement
  - Archive data

- ✅ View Detail Penyewa
  - Profil lengkap
  - Kamar yang ditempati
  - Riwayat pembayaran
  - Contact information

#### Fitur Tambahan

**Payment History Tab**

- Daftar semua pembayaran
- Filter by periode/status
- Download receipt
- View transaction details

**Room Change History**

- Riwayat perpindahan kamar
- Tanggal check-in/check-out
- Alasan perubahan

**Communication**

- Send WhatsApp reminder
- Send email notification
- View komunikasi history

---

## Keuangan Management

### Tagihan (Billing)

**Menu**: Sidebar → Keuangan → Tagihan

#### Status Tagihan

- 🔵 **Belum Bayar** - Belum ada pembayaran
- 🟡 **Lunas Sebagian** - Pembayaran partial
- 🟢 **Lunas** - Pembayaran penuh
- 🔴 **Overdue** - Terlambat pembayaran

#### Fitur

1. **View Tagihan**

   - List semua tagihan dengan filter status
   - Sorting by tanggal/jumlah/penyewa
   - Search by penyewa name
   - Export to Excel/PDF

2. **Record Pembayaran**

   - Input tanggal pembayaran
   - Input jumlah pembayaran
   - Input metode (cash/bank transfer/e-wallet)
   - Pilih yang menerima pembayaran
   - Catatan (optional)
   - Generate receipt

3. **Tagihan Detail**

   - View bulan tagihan
   - View penyewa info
   - Breakdown biaya (sewa + tambahan)
   - Payment history

4. **Bulk Actions**
   - Generate monthly bills
   - Send reminder SMS/WhatsApp
   - Export selected bills

### Transaksi (Transactions)

**Menu**: Sidebar → Keuangan → Transaksi

#### Jenis Transaksi

1. **Income (Pemasukan)**

   - Sewa kamar
   - Biaya tambahan
   - Denda keterlambatan
   - Other income

2. **Expense (Pengeluaran)**
   - Maintenance
   - Utilities (listrik, air, internet)
   - Supplies
   - Other expenses

#### Fitur

- ✅ Tambah Transaksi

  - Tipe (income/expense)
  - Kategori
  - Jumlah
  - Tanggal
  - Deskripsi
  - Bukti (optional)

- ✅ View Transaksi

  - List dengan filter kategori/tipe
  - Sorting by tanggal/jumlah
  - Search by deskripsi
  - Monthly summary

- ✅ Edit/Hapus Transaksi
  - Modifikasi detail
  - Soft delete (archive)
  - Restore if needed

---

## Sistem Notifikasi ⭐

**Menu**: Sidebar → Notifikasi (bell icon di topbar)

### Fitur Notifikasi Otomatis

Sistem automatic notification ketika tagihan akan jatuh tempo:

1. **H-7 Days** (7 hari sebelum)

   - Friendly reminder
   - Jangan lupa bayar minggu depan

2. **H-3 Days** (3 hari sebelum)

   - Urgent reminder
   - Bayar dalam 3 hari

3. **H-1 Day** (1 hari sebelum)

   - Final notice
   - Bayar hari ini atau besok overdue

4. **OVERDUE** (Lewat jatuh tempo)
   - Alert overdue
   - Tindakan yang diperlukan

### Notification Center UI

**Bell Icon** (di Topbar)

- Menampilkan jumlah unread notifications
- Dropdown menu dengan daftar notifikasi
- Color-coded by priority:
  - 🔴 OVERDUE - Merah
  - 🟠 H-1 - Orange
  - 🟡 H-3 - Yellow
  - 🔵 H-7 - Blue

### Action Buttons

- ✅ Mark as Read
- 🗑️ Delete
- 👁️ View Details (link ke tagihan)

### Notification Types

- Pembayaran Jatuh Tempo
- Kamar Kosong (available)
- Maintenance Required
- System Alerts

### Features

- Auto-check setiap jam
- Push notifications (jika diaktifkan)
- Email notifications (optional)
- WhatsApp notifications (jika configured)
- Notification history
- Batch operations

---

## Laporan & Analytics ⭐

**Menu**: Sidebar → Laporan → Keuangan

### Dashboard Laporan

#### 1. Monthly Report

Breakdown penghuni dan keuangan per bulan:

**Data yang ditampilkan:**

- Total penyewa bulan ini
- Total pembayaran diterima
- Total expense
- Net profit/loss
- Occupancy rate

**Breakdown by Tenant:**

- Nama penyewa
- Kamar
- Harga sewa
- Status pembayaran
- Action buttons

#### 2. Yearly Report

Aggregasi data per tahun:

**Data yang ditampilkan:**

- Total annual revenue
- Total annual expense
- Annual profit
- Monthly comparison
- Year-over-year growth

#### 3. Cash Flow Projection

Proyeksi arus kas 6 bulan ke depan:

**Komponen:**

- Projected income (based on occupancy & payment rate)
- Projected expense (average monthly)
- Net cash flow
- Cumulative cash position
- Variance analysis

### Chart Types

1. **Bar Chart** - Monthly P&L

   - Green bar: Profit
   - Red bar: Loss
   - Interactive tooltip

2. **Line Chart** - Revenue Trend

   - Revenue line
   - Expense line
   - Moving average

3. **Pie Chart** - Tagihan Status

   - Lunas %
   - Overdue %
   - Pending %

4. **Area Chart** - Cash Flow
   - Projected vs Actual
   - Cumulative line

### Export Functionality

**Export to PDF**

- Full page report
- Charts included
- Professional layout
- Watermark (optional)

**Export to Excel**

- Spreadsheet format
- Detailed data
- Sortable/Filterable
- Multiple sheets

### Filters & Date Range

- **Date Range Picker**

  - Custom range
  - Last month
  - Last quarter
  - Last year
  - Year-to-date

- **Filter by**
  - Tenant name
  - Room type
  - Payment status
  - Transaction category

---

## WhatsApp Integration ⭐

**Requires**: Twilio Account Setup

### Setup Instructions

1. **Get Twilio Credentials**

   - Create Twilio account: https://www.twilio.com
   - Get Account SID
   - Get Auth Token
   - Get WhatsApp-enabled phone number

2. **Configure Backend**

   - Update `backend/.env`:

   ```env
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+62xxxx...
   ```

3. **Test Connection**
   - Go to Laporan → WhatsApp Settings
   - Click "Test Message"
   - Verify WhatsApp receipt

### Features

#### 1. Send Individual Reminder

```
Path: POST /api/whatsapp/send
Body: {
  penyewa_id: 123,
  message_type: "H-7" | "H-3" | "H-1" | "OVERDUE"
}
```

Message template:

```
Halo Pak/Bu [Nama],

Reminder: Tagihan sewa kamar Anda untuk bulan ini
akan jatuh tempo dalam [X hari].

Jumlah: Rp [amount]
Jatuh Tempo: [due date]
Kamar: [room number]

Silakan lakukan pembayaran sebelum tanggal jatuh tempo.
Terima kasih!
```

#### 2. Broadcast Reminder

```
Path: POST /api/whatsapp/broadcast
Body: {
  message_type: "OVERDUE",
  filter_tags: ["overdue", "high_priority"]
}
```

Send to all overdue penyewa sekaligus.

#### 3. Settings Management

```
GET /api/whatsapp/settings
PUT /api/whatsapp/settings
```

#### 4. Message History

- View sent messages
- Delivery status
- Read receipts (jika available)
- Retry failed messages

### Best Practices

1. **Timing**

   - H-7 notification: Setiap hari Senin jam 10:00
   - H-3 notification: Setiap hari Jumat jam 14:00
   - H-1 notification: Setiap hari Sabtu jam 17:00
   - OVERDUE: Setiap hari pukul 08:00

2. **Message Content**

   - Keep it friendly & professional
   - Include all necessary information
   - Add payment instructions
   - Include contact info

3. **Frequency Control**
   - Don't spam yang sudah bayar
   - Max 2 messages per hari per penyewa
   - Respect quiet hours

---

## User Management

**Menu**: Sidebar → Pengaturan → User Management

### Admin Features

#### User List

- View semua users
- Filter by role
- Search by email/name
- Status (active/inactive)

#### User CRUD

1. **Create User**

   - Email
   - Name
   - Role (Admin/Staff/Viewer)
   - Password (auto-generated)
   - Send welcome email

2. **Edit User**

   - Update profil
   - Change role
   - Reset password
   - Enable/disable account

3. **Delete User**
   - Archive atau hard delete
   - Confirm action
   - Log deletion

#### Role-Based Access

- **Admin**: Full access

  - Manage users
  - Configure system
  - View all reports
  - Access settings

- **Staff**: Limited access

  - Manage penghuni/tagihan
  - View reports
  - No user management
  - No system settings

- **Viewer**: Read-only
  - View dashboard
  - View reports
  - No editing capabilities

#### Security Features

- Password hashing (bcrypt)
- JWT token authentication
- Session timeout
- Activity logging
- IP whitelisting (optional)

---

## 🔑 Keyboard Shortcuts

| Shortcut   | Action                      |
| ---------- | --------------------------- |
| `Ctrl + K` | Open search/command palette |
| `Ctrl + /` | Open help                   |
| `Ctrl + T` | Toggle theme (dark/light)   |
| `Escape`   | Close modals/dropdown       |
| `Enter`    | Submit forms                |

---

## 📱 Mobile Responsiveness

Semua fitur responsive dan bekerja optimal di:

- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

**Mobile-specific optimizations:**

- Simplified navigation
- Touch-friendly buttons
- Optimized charts
- Collapsible sections
- Bottom navigation (optional)

---

## 🎨 Customization

### Theme Colors

Edit `frontend/app/globals.css`:

```css
--primary: #7c3aed; /* Violet/Purple */
--secondary: #ec4899; /* Pink */
--accent: #06b6d4; /* Cyan */
--success: #10b981; /* Green */
--warning: #f59e0b; /* Amber */
--error: #ef4444; /* Red */
```

### Dark Mode

Automatic light/dark mode toggle.
Uses `next-themes` for persistence.

---

## 📊 Data Export Formats

### PDF Export

- Professional layout
- Company header
- Generated date/time
- Charts as images
- Digital signature space (optional)

### Excel Export

- Multiple sheets
- Formulas for calculations
- Sorting/filtering enabled
- Print-friendly
- Data validation

### CSV Export

- Standard comma-separated
- UTF-8 encoding
- Compatible with all spreadsheet apps

---

## 🔐 Data Security

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention (GORM)
- ✅ CORS protection
- ✅ Input validation (Zod)
- ✅ Rate limiting (optional)
- ✅ Audit logging

---

## 💾 Data Backup

### Recommended Backup Schedule

- Daily: Automatic DB backup
- Weekly: Full system backup
- Monthly: Archive backup

### Backup Methods

1. PostgreSQL `pg_dump`
2. Cloud backup (AWS S3, Google Cloud)
3. Manual export to files

```bash
# Backup database
pg_dump kos_muhandis > backup.sql

# Restore from backup
psql kos_muhandis < backup.sql
```

---

## 🚀 Performance Tips

1. **Database**

   - Index frequently queried columns
   - Archive old transactions
   - Regular vacuum

2. **Frontend**

   - Lazy load images
   - Code splitting
   - Browser caching
   - CDN for static assets

3. **Backend**
   - Connection pooling
   - Query optimization
   - Response caching
   - Pagination

---

## 📞 Support & Troubleshooting

See `SETUP_GUIDE.md` for troubleshooting.

For additional help:

- Check GitHub issues
- Email support
- Community forum

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Status**: ✅ Production Ready
