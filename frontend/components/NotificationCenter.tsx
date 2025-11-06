'use client'

import { motion } from 'framer-motion'
import { Bell, AlertTriangle, AlertCircle, Clock, Trash2, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'

interface Notification {
  id: number
  penyewa_nama: string
  tipe: string
  status: string
  message: string
  bulan: string
  jumlah: number
  sent_at?: string
  created_at: string
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/notifikasi', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(response.data || [])
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:8080/notifikasi/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8080/notifikasi/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to delete notification', error)
    }
  }

  const getNotificationIcon = (tipe: string) => {
    switch (tipe) {
      case 'H-7':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'H-3':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'H-1':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'OVERDUE':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getNotificationColor = (tipe: string) => {
    switch (tipe) {
      case 'H-7':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'H-3':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'H-1':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'OVERDUE':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const unreadCount = notifications.filter(n => n.status === 'pending').length

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-surface dark:hover:bg-dark-surface rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-text-primary dark:text-dark-text-primary" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-96 bg-surface dark:bg-dark-surface rounded-xl shadow-xl border border-border dark:border-dark-border z-50 max-h-96 overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border p-4 flex items-center justify-between">
            <h3 className="font-semibold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifikasi Pembayaran
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  // Mark all as read
                  for (const notif of notifications.filter(n => n.status === 'pending')) {
                    await handleMarkAsRead(notif.id)
                  }
                }}
                className="text-xs text-accent hover:text-hover"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-text-secondary dark:text-dark-text-secondary">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-border dark:divide-dark-border">
              {notifications.map(notif => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 border-l-4 ${getNotificationColor(notif.tipe)} transition-colors hover:opacity-75`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.tipe)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary dark:text-dark-text-primary text-sm">
                        {notif.penyewa_nama}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
                        Tagihan: Rp {notif.jumlah.toLocaleString()} • Bulan: {notif.bulan}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                        {new Date(notif.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {notif.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-1 hover:bg-accent/20 rounded transition-colors"
                          title="Tandai dibaca"
                        >
                          <Check className="w-4 h-4 text-accent" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
