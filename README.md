# Sistem Manajemen Kos Modern

Full-stack web application untuk manajemen kos dengan arsitektur modern menggunakan Golang backend dan Next.js frontend. Dilengkapi dengan sistem notifikasi cerdas, laporan keuangan komprehensif, dan integrasi WhatsApp.

## 🎯 Fitur Utama

### Core Features

- ✅ Autentikasi dengan JWT dan password hashing (bcrypt)
- ✅ Dashboard dengan analytics dan real-time data
- ✅ Manajemen Kamar, Penyewa, Tagihan & Transaksi
- ✅ UI modern dengan tema lilac, dark mode support
- ✅ Responsive design untuk desktop dan mobile

### ⭐ Fitur Premium (Recently Added)

- ✅ **Sistem Notifikasi Cerdas**: Notifikasi pembayaran jatuh tempo (H-7, H-3, H-1, OVERDUE)
- ✅ **Laporan Keuangan Komprehensif**: Dashboard laporan dengan charts, cash flow projection, export PDF/Excel
- ✅ **Integrasi WhatsApp**: Reminder pembayaran otomatis via WhatsApp (siap integrasi Twilio)
- ✅ **Grouped Navigation**: Sidebar dengan menu groups untuk UX yang lebih baik
- ✅ **Notification Center**: Bell icon di topbar dengan notification dropdown

## 📊 Tech Stack

### Backend

- **Runtime**: Golang 1.21+
- **Framework**: Gin (lightweight web framework)
- **Database**: PostgreSQL dengan GORM ORM
- **Authentication**: JWT tokens + bcrypt password hashing
- **API**: RESTful architecture dengan middleware support
- **Dependencies**:
  - `gin-contrib/cors` - CORS handling
  - `gorm.io/gorm` - ORM
  - `gorm.io/driver/postgres` - PostgreSQL driver
  - `jwt-go` - JWT token handling
  - `godotenv` - Environment variables
  - `twilio-go` - WhatsApp integration ready

### Frontend

- **Framework**: Next.js 14 dengan App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + Custom theme system
- **Charts**: Recharts (bar, line, pie charts)
- **UI Components**: Lucide React icons
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Form Handling**: React Hook Form + Zod validation
- **Data Fetching**: Axios
- **Animations**: Framer Motion
- **Export**: jsPDF & XLSX
- **Theme**: next-themes (dark/light mode)
- **Notifications**: react-hot-toast
- **Port**: 9000 (default)

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL 12+
- npm atau yarn

### Step 1: Setup Database

```bash
# Buat database PostgreSQL
createdb kos_muhandis

# Atau dari psql
psql -U postgres
CREATE DATABASE kos_muhandis;
```

### Step 2: Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env
# Edit .env dengan kredensial database Anda

# Download dependencies
go mod tidy

# Run migration & start server
go run main.go
```

Server akan jalan di `http://localhost:8080`

**Default Admin Credentials** (jika tersedia):

- Email: `admin@kos.com`
- Password: `admin123`

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend akan accessible di `http://localhost:9000`

### Environment Variables

#### Backend (`.env`)

```env
# Database Configuration
DATABASE_URL=host=localhost user=postgres password=your_password dbname=kos_muhandis port=5432 sslmode=disable

# Server Configuration
PORT=8080
GIN_MODE=debug

# JWT Configuration
JWT_SECRET=your_super_secret_key_at_least_32_characters_long

# WhatsApp Integration (Optional - Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Kos Muhandis
```

## 📱 Fitur Detail

### 1. Dashboard

- Real-time statistics (total kamar, penghuni, tagihan)
- Monthly revenue & expense charts
- Room occupancy visualization
- Notification alerts
- Quick action buttons

### 2. Manajemen Properti

- **Kamar**: CRUD, status tracking (kosong/terisi), harga
- **Penghuni**: Profil lengkap, kontak, riwayat pembayaran
- **Tagihan**: Tracking status pembayaran, pencatatan pembayaran
- **Transaksi**: Income & expense tracking

### 3. Sistem Notifikasi ⭐

- Automatic notifications untuk:
  - H-7 hari sebelum jatuh tempo
  - H-3 hari sebelum jatuh tempo
  - H-1 hari sebelum jatuh tempo
  - Status OVERDUE
- Notification center dengan action buttons
- Mark as read functionality
- Real-time updates

### 4. Laporan Keuangan ⭐

- **Monthly Report**: Breakdown penghuni, income, expense, profit
- **Yearly Report**: Aggregate data per tahun
- **Cash Flow Projection**: 6-month forecast
- **Detailed Report**: Drill down ke transaksi individual
- Export ke PDF & Excel
- Interactive charts dengan Recharts

### 5. WhatsApp Integration ⭐

- Send reminder ke specific penghuni
- Broadcast reminder untuk semua overdue
- Auto-format nomor telepon
- Siap integrasi Twilio (placeholder sudah ada)
- Test message functionality

## 🔐 API Routes

### Authentication

- `POST /api/auth/register` - Register akun baru
- `POST /api/auth/login` - Login dengan email & password
- `GET /api/auth/me` - Get current user info

### Notifikasi (Protected)

- `GET /api/notifikasi/check` - Check dan create notifikasi jatuh tempo
- `GET /api/notifikasi/dashboard` - Get notification summary
- `GET /api/notifikasi/list` - Get semua notifikasi
- `PUT /api/notifikasi/:id/read` - Mark notifikasi as read
- `DELETE /api/notifikasi/:id` - Delete notifikasi

### Laporan (Protected)

- `GET /api/report/monthly?month=1&year=2024` - Monthly report
- `GET /api/report/yearly?year=2024` - Yearly report
- `GET /api/report/detail?startDate=2024-01-01&endDate=2024-12-31` - Detailed report
- `GET /api/report/cashflow` - Cash flow projection

### WhatsApp (Protected)

- `POST /api/whatsapp/send` - Send reminder ke spesifik penghuni
- `POST /api/whatsapp/broadcast` - Broadcast ke semua overdue
- `POST /api/whatsapp/test` - Test message
- `GET /api/whatsapp/settings` - Get WhatsApp settings
- `PUT /api/whatsapp/settings` - Update WhatsApp settings

_Semua route kecuali auth memerlukan valid JWT token di header Authorization: `Bearer {token}`_

## 📂 Project Structure

```
kos-muhandis/
├── backend/
│   ├── controllers/          # Business logic
│   │   ├── auth.go
│   │   ├── dashboard.go
│   │   ├── kamar.go
│   │   ├── notifikasi.go    # ⭐ Baru
│   │   ├── penyewa.go
│   │   ├── report.go        # ⭐ Baru
│   │   ├── tagihan.go
│   │   ├── transaksi.go
│   │   ├── users.go
│   │   └── whatsapp.go      # ⭐ Baru
│   ├── database/            # DB connection & migration
│   ├── middlewares/         # Auth middleware
│   ├── models/              # Data models
│   │   ├── notifikasi.go    # ⭐ Baru
│   │   └── ...
│   ├── routes/              # Route definitions
│   ├── utils/               # Helper functions
│   ├── main.go
│   └── go.mod
│
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   │   ├── dashboard/
│   │   ├── kamar/
│   │   ├── penyewa/
│   │   ├── tagihan/
│   │   ├── transaksi/
│   │   ├── laporan/         # ⭐ Baru (Reports dashboard)
│   │   ├── login/
│   │   ├── register/
│   │   └── users/
│   ├── components/          # Reusable React components
│   │   ├── Sidebar.tsx      # ⭐ Updated (grouped menu)
│   │   ├── NotificationCenter.tsx  # ⭐ Baru
│   │   └── ...
│   ├── schemas/             # Validation schemas (Zod)
│   └── package.json
│
└── README.md
```

## 🛠️ Development

### Backend Development

```bash
cd backend

# Run dengan hot reload (install air first)
go install github.com/cosmtrek/air@latest
air

# Build for production
go build -o kos-muhandis
```

### Frontend Development

```bash
cd frontend

# Run dev server dengan hot reload
npm run dev

# Build for production
npm run build
npm start
```

## 📈 Performance Optimization

- **Backend**: Connection pooling, query optimization dengan GORM
- **Frontend**: Image optimization, code splitting, lazy loading
- **Database**: Indexed queries, proper relationships
- **API**: Pagination support, response caching

## 🔒 Security Features

- JWT token-based authentication
- Password hashing dengan bcrypt
- CORS protection
- SQL injection prevention (GORM)
- Input validation dengan Zod
- Middleware protection untuk protected routes
- Environment variables untuk sensitive data

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check database connection
psql kos_muhandis

# Verify .env file exists and has correct DATABASE_URL
cat .env

# Check if port 8080 is already in use
netstat -an | grep 8080
```

### Frontend Build Issues

```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install

# Clear Next.js cache
rm -r .next
npm run dev
```

### Database Migration Failed

```bash
# Drop dan recreate database
dropdb kos_muhandis
createdb kos_muhandis

# Re-run backend (will auto-migrate)
go run main.go
```

## 📝 API Testing

Gunakan Postman atau Thunder Client untuk test API:

1. Register: `POST /api/auth/register` dengan body `{email, password, name}`
2. Login: `POST /api/auth/login` dengan body `{email, password}`
3. Copy token dari response
4. Add header: `Authorization: Bearer {token}` untuk protected routes
5. Test semua endpoint

## 🚢 Deployment

### Backend (Heroku/Railway/Render)

```bash
# Build binary
go build -o main

# Set environment variables di platform
# Run: ./main
```

### Frontend (Vercel/Netlify)

```bash
# Push ke GitHub
# Connect repository ke Vercel
# Auto deploy on push
```

## 📄 License

MIT License - Feel free to use for personal or commercial projects

## 👨‍💻 Support & Contribution

Untuk issues, suggestions, atau contributions:

1. Open GitHub Issue
2. Create Pull Request dengan deskripsi jelas
3. Follow commit message conventions

---

**Last Updated**: November 2024
**Status**: Production Ready ✅
