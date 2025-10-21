import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface Column {
  key: string
  header: string
  render?: (value: any, row: any) => React.ReactNode
}

interface TableProps {
  columns: Column[]
  data: any[]
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (row: any) => void
  itemsPerPage?: number
  showPagination?: boolean
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = []
    const delta = 2 // Number of pages to show around current page

    // Always show first page
    if (1 < currentPage - delta) {
      pages.push(1)
      if (2 < currentPage - delta) {
        pages.push('...')
      }
    }

    // Show pages around current page
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i)
    }

    // Always show last page
    if (totalPages > currentPage + delta) {
      if (totalPages - 1 > currentPage + delta) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface dark:bg-dark-surface border-t border-border dark:border-dark-border">
      <div className="flex items-center text-sm text-text-secondary dark:text-dark-text-secondary">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-text-secondary dark:text-dark-text-secondary bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-md hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span className="sr-only">Previous</span>
          ‹
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentPage === page
                    ? 'bg-primary dark:bg-dark-primary text-white'
                    : 'text-text-primary dark:text-dark-text-primary bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-text-secondary dark:text-dark-text-secondary bg-bg-primary dark:bg-dark-bg-primary border border-border dark:border-dark-border rounded-md hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span className="sr-only">Next</span>
          ›
        </button>
      </div>
    </div>
  )
}

export const DataTable: React.FC<TableProps> = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  onRowClick,
  itemsPerPage = 10,
  showPagination = true
}) => {
  const [currentPage, setCurrentPage] = useState(1)

  const { paginatedData, totalPages } = useMemo(() => {
    const total = Math.ceil(data.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginated = data.slice(startIndex, endIndex)

    return {
      paginatedData: paginated,
      totalPages: total
    }
  }, [data, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl shadow-sm border border-border dark:border-dark-border overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-secondary dark:text-dark-text-secondary">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl shadow-sm border border-border dark:border-dark-border overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-text-secondary dark:text-dark-text-secondary">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface dark:bg-dark-surface backdrop-blur-sm rounded-xl shadow-sm border border-border dark:border-dark-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-secondary dark:bg-dark-bg-secondary">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-dark-border">
            {paginatedData.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`${
                  onRowClick ? 'cursor-pointer hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary' : ''
                } transition-colors duration-200`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-dark-text-primary">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}