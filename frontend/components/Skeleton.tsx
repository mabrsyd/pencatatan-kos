'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = 'bg-surface dark:bg-dark-surface animate-pulse'

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded'
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
      default:
        return 'rounded-lg'
    }
  }

  const getSizeClasses = () => {
    const widthClass = width ? `w-${width}` : 'w-full'
    const heightClass = height ? `h-${height}` : variant === 'text' ? 'h-4' : 'h-32'
    return `${widthClass} ${heightClass}`
  }

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.1
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-bg-primary dark:bg-dark-bg-primary rounded-xl p-4 border border-border dark:border-dark-border">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circular" width="10" height="10" />
        <div className="flex-1">
          <Skeleton variant="text" className="mb-1" />
          <Skeleton variant="text" width="3/4" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="2/3" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Table Header */}
      <div className="flex gap-4 pb-2 border-b border-border dark:border-dark-border">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} variant="text" className="flex-1" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-bg-primary dark:bg-dark-bg-primary rounded-xl p-4 border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <Skeleton variant="circular" width="8" height="8" />
            <Skeleton variant="text" width="16" />
          </div>
          <Skeleton variant="text" className="mb-1" />
          <Skeleton variant="text" width="2/3" />
        </div>
      ))}
    </div>
  )
}