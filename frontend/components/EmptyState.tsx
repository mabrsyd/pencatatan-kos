'use client'

import { motion } from 'framer-motion'
import { FileX, Users, Home, Receipt, TrendingUp, Search, Plus } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  variant?: 'default' | 'search' | 'error'
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default'
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return <Search className="w-12 h-12 text-text-secondary dark:text-dark-text-secondary" />
      case 'error':
        return <FileX className="w-12 h-12 text-red-500" />
      default:
        return <FileX className="w-12 h-12 text-text-secondary dark:text-dark-text-secondary" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-4"
      >
        {icon || getDefaultIcon()}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-text-secondary dark:text-dark-text-secondary mb-6 max-w-md"
      >
        {description}
      </motion.p>

      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary dark:bg-dark-primary text-white rounded-lg hover:bg-hover dark:hover:bg-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2"
        >
          {action.icon}
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}

// Predefined empty states for common use cases
export function EmptyKamar({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<Home className="w-12 h-12 text-text-secondary dark:text-dark-text-secondary" />}
      title="Belum ada kamar"
      description="Belum ada data kamar yang terdaftar. Tambahkan kamar pertama untuk mulai mengelola properti kos Anda."
      action={{
        label: "Tambah Kamar",
        onClick: onAdd,
        icon: <Plus className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyPenyewa({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-12 h-12 text-text-secondary dark:text-dark-text-secondary" />}
      title="Belum ada penyewa"
      description="Belum ada data penyewa yang terdaftar. Tambahkan penyewa pertama untuk mulai mengelola penghuni kos Anda."
      action={{
        label: "Tambah Penyewa",
        onClick: onAdd,
        icon: <Plus className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyTransaksi() {
  return (
    <EmptyState
      icon={<Receipt className="w-12 h-12 text-text-secondary dark:text-dark-text-secondary" />}
      title="Belum ada transaksi"
      description="Belum ada data transaksi keuangan yang tercatat. Tambah transaksi pemasukan atau pengeluaran pertama untuk mulai mencatat arus kas kos Anda."
    />
  )
}

export function EmptyTagihan({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<TrendingUp className="w-12 h-12 text-text-secondary dark:text-dark-text-secondary" />}
      title="Belum ada tagihan"
      description="Belum ada data tagihan yang dibuat. Buat tagihan pertama untuk mulai mengelola pembayaran penghuni kos."
      action={{
        label: "Buat Tagihan",
        onClick: onAdd,
        icon: <Plus className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyUsers({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-12 h-12 text-text-secondary dark:text-dark-text-secondary" />}
      title="Belum ada pengguna"
      description="Belum ada data pengguna yang terdaftar. Tambahkan pengguna pertama untuk mulai mengelola akses sistem."
      action={{
        label: "Tambah Pengguna",
        onClick: onAdd,
        icon: <Plus className="w-4 h-4" />
      }}
    />
  )
}

export function EmptySearch({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      variant="search"
      title="Tidak ada hasil"
      description="Tidak ditemukan data yang sesuai dengan kriteria pencarian Anda. Coba ubah kata kunci atau filter yang digunakan."
      action={{
        label: "Reset Pencarian",
        onClick: onClear
      }}
    />
  )
}