# Sistem Manajemen Kos Modern

Full-stack web application untuk manajemen kos dengan arsitektur modern menggunakan Golang backend dan Next.js frontend.

## Fitur Utama

- ✅ Autentikasi dengan JWT
- ✅ Dashboard dengan analitik dan grafik
- ✅ Manajemen Kamar, Penyewa, Tagihan
- ✅ Transaksi dan Pengeluaran
- ✅ UI modern dengan tema lilac
- ✅ Responsive design

## Tech Stack

### Backend

- Golang dengan Gin framework
- PostgreSQL database
- GORM ORM
- JWT authentication
- bcrypt password hashing

### Frontend

- Next.js 14 dengan App Router
- TypeScript
- TailwindCSS
- Recharts untuk grafik
- Axios untuk API calls

## Setup

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
cd backend
go mod tidy
# Setup PostgreSQL database 'kos_muhandis'
# Update .env file with your database credentials
go run main.go
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Buat file `.env` di folder backend:

```
DATABASE_URL=host=localhost user=postgres password=your_password dbname=kos_muhandis port=5432 sslmode=disable
JWT_SECRET=your_secret_key_here
PORT=8080
```

1. Start PostgreSQL and create database
2. Run backend: `go run main.go` (port 8080)
3. Run frontend: `npm run dev` (port 3000)
4. Access at http://localhost:3000

## Features Overview

- **Dashboard**: Statistics, monthly revenue/expense charts, occupancy pie chart
- **Room Management**: CRUD operations for rooms
- **Tenant Management**: CRUD with automatic room status updates
- **Billing**: Monthly bill generation and status tracking
- **Transactions**: Income and expense tracking
- **User Management**: Admin panel for user management
- **Modern UI**: Lilac theme, responsive, dark mode support
