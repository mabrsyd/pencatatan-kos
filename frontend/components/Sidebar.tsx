'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bed, Users, Receipt, TrendingUp, DollarSign, UserCheck, Menu, X } from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/kamar', label: 'Kamar', icon: Bed },
    { href: '/penyewa', label: 'Penyewa', icon: Users },
    { href: '/tagihan', label: 'Tagihan', icon: Receipt },
    { href: '/transaksi', label: 'Transaksi', icon: TrendingUp },
    { href: '/pengeluaran', label: 'Pengeluaran', icon: DollarSign },
    { href: '/users', label: 'Users', icon: UserCheck },
  ]

  return (
    <div className={`bg-lilac-dark text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen`}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-xl font-bold">Kos Muhandis</h1>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-white">
          {isCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center px-4 py-3 hover:bg-lilac transition-colors ${isActive ? 'bg-lilac' : ''}`}>
                <Icon size={20} className="mr-3" />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}