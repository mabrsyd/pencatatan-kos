'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'success' | 'info' | 'warning'
  isLoading?: boolean
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'warning',
  isLoading = false
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isLoading, onClose])

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <X className="w-6 h-6 text-red-500" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />
      case 'warning':
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
    }
  }

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
      case 'success':
        return 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
      case 'warning':
      default:
        return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={!isLoading ? onClose : undefined}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-bg-primary dark:bg-dark-bg-primary rounded-xl shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border">
                <div className="flex items-center gap-3">
                  {getIcon()}
                  <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                    {title}
                  </h3>
                </div>
                {!isLoading && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-surface dark:hover:bg-dark-surface transition-colors"
                    aria-label="Tutup modal"
                  >
                    <X className="w-5 h-5 text-text-secondary dark:text-dark-text-secondary" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-4 border-t border-border dark:border-dark-border">
                {!isLoading && (
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-text-secondary dark:text-dark-text-secondary border border-border dark:border-dark-border rounded-lg hover:bg-surface dark:hover:bg-dark-surface transition-colors focus:outline-none focus:ring-2 focus:ring-border dark:focus:ring-dark-border"
                    disabled={isLoading}
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles()}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}