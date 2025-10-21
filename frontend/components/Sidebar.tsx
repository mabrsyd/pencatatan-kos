'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Home, Bed, Users, Receipt, TrendingUp, DollarSign, UserCheck, Menu, X, Building, LogOut, Moon, Sun, User } from 'lucide-react'

interface SidebarProps {
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
}

export default function Sidebar({ isCollapsed: propIsCollapsed, setIsCollapsed: propSetIsCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsed))
    if (propSetIsCollapsed) {
      propSetIsCollapsed(newCollapsed)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/kamar', label: 'Kamar', icon: Bed },
    { href: '/penyewa', label: 'Penyewa', icon: Users },
    { href: '/tagihan', label: 'Tagihan', icon: Receipt },
    { href: '/transaksi', label: 'Transaksi', icon: TrendingUp },
    { href: '/users', label: 'Users', icon: UserCheck },
  ]

  return (
    <div className={`fixed top-0 left-0 z-40 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'} h-screen`}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg-primary to-dark-surface dark:from-dark-bg-primary dark:to-dark-surface"></div>

      {/* Glassmorphism Overlay */}
      <div className="relative backdrop-blur-xl bg-surface/80 dark:bg-dark-surface/80 border-r border-border dark:border-dark-border h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center shadow-sm">
                  <Building size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Kos Muhandis</h1>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Management</p>
                </div>
              </div>
            )}
            <button
              onClick={handleToggleCollapse}
              className="p-1.5 rounded-lg bg-surface hover:bg-hover/10 dark:bg-dark-surface dark:hover:bg-dark-hover/10 transition-all duration-300 hover:scale-105"
            >
              {isCollapsed ? (
                <Menu size={16} className="text-text-primary dark:text-dark-text-primary" />
              ) : (
                <X size={16} className="text-text-primary dark:text-dark-text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-dark-primary/10 dark:text-dark-primary shadow-sm'
                      : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary dark:bg-dark-primary rounded-r-full"></div>
                  )}

                  {/* Icon */}
                  <div className={`flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/20 text-primary dark:bg-dark-primary/20 dark:text-dark-primary'
                      : 'bg-transparent group-hover:bg-primary/10 dark:group-hover:bg-dark-primary/10 text-text-secondary dark:text-dark-text-secondary group-hover:text-primary dark:group-hover:text-dark-primary'
                  }`}>
                    <Icon size={16} />
                  </div>

                  {/* Label */}
                  {!isCollapsed && (
                    <span className={`ml-3 text-sm font-medium transition-all duration-300 ${
                      isActive ? 'text-primary dark:text-dark-primary' : 'text-text-secondary dark:text-dark-text-secondary group-hover:text-text-primary dark:group-hover:text-dark-text-primary'
                    }`}>
                      {item.label}
                    </span>
                  )}

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-lg bg-primary/0 group-hover:bg-primary/5 dark:group-hover:bg-dark-primary/5 transition-all duration-300"></div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t  border-border dark:border-dark-border bg-surface/50 dark:bg-dark-surface/50 ">
          <div className="p-3">
            {/* User Info */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} mb-3`}>
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center shadow-sm">
                  <User size={16} className="text-white" />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-surface dark:border-dark-surface rounded-full"></div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary truncate capitalize">{user?.role || 'Role'}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={`grid ${isCollapsed ? 'grid-cols-1 gap-1.5' : 'grid-cols-2 gap-1.5'}`}>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="group relative flex items-center justify-center p-2 rounded-lg bg-surface hover:bg-hover/10 dark:bg-dark-surface dark:hover:bg-dark-hover/10 transition-all duration-300 hover:scale-105"
                title={isCollapsed ? (mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode') : ''}
              >
                {mounted && theme === 'dark' ? (
                  <Sun size={16} className="text-yellow-500 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                ) : (
                  <Moon size={16} className="text-blue-600 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                )}
                {!isCollapsed && (
                  <span className="ml-2 text-xs font-medium text-text-primary dark:text-dark-text-primary relative z-10">
                    {mounted && theme === 'dark' ? 'Light' : 'Dark'}
                  </span>
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="group relative flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-105"
                title={isCollapsed ? 'Logout' : ''}
              >
                <LogOut size={16} className="text-red-500 dark:text-red-400 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                {!isCollapsed && (
                  <span className="ml-2 text-xs font-medium text-red-600 dark:text-red-300 relative z-10">Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}