'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { 
  Home, Bed, Users, Receipt, TrendingUp, DollarSign, UserCheck, 
  Menu, X, Building, LogOut, Moon, Sun, User, ChevronDown, Settings,
  BarChart3, FileText
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
}

interface MenuItem {
  label: string
  href: string
  icon: any
}

interface MenuGroup {
  label: string
  icon: any
  items: MenuItem[]
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('expandedMenuGroups')
      return saved ? JSON.parse(saved) : { Properti: true, Penghuni: true, Keuangan: true }
    }
    return { Properti: true, Penghuni: true, Keuangan: true }
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

  const toggleGroupExpand = (groupLabel: string) => {
    const newExpanded = { ...expandedGroups, [groupLabel]: !expandedGroups[groupLabel] }
    setExpandedGroups(newExpanded)
    localStorage.setItem('expandedMenuGroups', JSON.stringify(newExpanded))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const menuGroups: MenuGroup[] = [
    {
      label: 'Properti',
      icon: Building,
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/kamar', label: 'Kamar', icon: Bed },
      ]
    },
    {
      label: 'Penghuni',
      icon: Users,
      items: [
        { href: '/penyewa', label: 'Daftar Penghuni', icon: Users },
      ]
    },
    {
      label: 'Keuangan',
      icon: DollarSign,
      items: [
        { href: '/tagihan', label: 'Tagihan', icon: Receipt },
        { href: '/transaksi', label: 'Transaksi', icon: TrendingUp },
      ]
    },
    {
      label: 'Laporan',
      icon: FileText,
      items: [
        { href: '/laporan', label: 'Keuangan', icon: BarChart3 },
      ]
    },
    {
      label: 'Pengaturan',
      icon: Settings,
      items: [
        { href: '/users', label: 'User Management', icon: UserCheck },
      ]
    },
  ]

  return (
    <div className={`fixed top-0 left-0 z-40 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'} h-screen`}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg-primary to-dark-surface dark:from-dark-bg-primary dark:to-dark-surface"></div>

      {/* Glassmorphism Overlay */}
      <div className="relative backdrop-blur-xl bg-surface/80 dark:bg-dark-surface/80 border-r border-border dark:border-dark-border h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border dark:border-dark-border flex-shrink-0">
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

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuGroups.map((group, groupIndex) => {
            const GroupIcon = group.icon
            const isExpanded = expandedGroups[group.label]
            const hasActiveChild = group.items.some(item => pathname === item.href)

            return (
              <div key={group.label}>
                {/* Group Header */}
                <button
                  onClick={() => !isCollapsed && toggleGroupExpand(group.label)}
                  className={`w-full group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 ${
                    !isCollapsed ? 'hover:scale-105' : ''
                  } ${
                    hasActiveChild
                      ? 'bg-primary/10 text-primary dark:bg-dark-primary/10 dark:text-dark-primary shadow-sm'
                      : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface'
                  }`}
                  style={{ animationDelay: `${groupIndex * 50}ms` }}
                >
                  {/* Active Indicator */}
                  {hasActiveChild && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary dark:bg-dark-primary rounded-r-full"></div>
                  )}

                  {/* Icon */}
                  <div className={`flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300 flex-shrink-0 ${
                    hasActiveChild
                      ? 'bg-primary/20 text-primary dark:bg-dark-primary/20 dark:text-dark-primary'
                      : 'bg-transparent group-hover:bg-primary/10 dark:group-hover:bg-dark-primary/10 text-text-secondary dark:text-dark-text-secondary group-hover:text-primary dark:group-hover:text-dark-primary'
                  }`}>
                    <GroupIcon size={16} />
                  </div>

                  {/* Label + Chevron */}
                  {!isCollapsed && (
                    <>
                      <span className={`ml-3 text-sm font-medium transition-all duration-300 flex-1 text-left ${
                        hasActiveChild ? 'text-primary dark:text-dark-primary' : 'text-text-secondary dark:text-dark-text-secondary group-hover:text-text-primary dark:group-hover:text-dark-text-primary'
                      }`}>
                        {group.label}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} className="text-text-secondary" />
                      </motion.div>
                    </>
                  )}

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-lg bg-primary/0 group-hover:bg-primary/5 dark:group-hover:bg-dark-primary/5 transition-all duration-300"></div>
                </button>

                {/* Group Items */}
                <AnimatePresence>
                  {isExpanded && !isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pl-2 mt-1">
                        {group.items.map((item, itemIndex) => {
                          const ItemIcon = item.icon
                          const isActive = pathname === item.href
                          return (
                            <Link key={item.href} href={item.href}>
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: itemIndex * 0.05 }}
                                className={`group/item relative flex items-center px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                                  isActive
                                    ? 'bg-primary/15 text-primary dark:bg-dark-primary/15 dark:text-dark-primary shadow-sm'
                                    : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface/50 dark:hover:bg-dark-surface/50'
                                }`}
                              >
                                {/* Active Indicator */}
                                {isActive && (
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary dark:bg-dark-primary rounded-r-full"></div>
                                )}

                                {/* Icon */}
                                <div className={`flex items-center justify-center w-5 h-5 rounded-md transition-all duration-300 flex-shrink-0 ${
                                  isActive
                                    ? 'bg-primary/20 text-primary dark:bg-dark-primary/20 dark:text-dark-primary'
                                    : 'bg-transparent group-hover/item:bg-primary/10 dark:group-hover/item:bg-dark-primary/10 text-text-secondary dark:text-dark-text-secondary group-hover/item:text-primary dark:group-hover/item:text-dark-primary'
                                }`}>
                                  <ItemIcon size={14} />
                                </div>

                                {/* Label */}
                                <span className={`ml-2.5 text-sm transition-all duration-300 ${
                                  isActive ? 'text-primary dark:text-dark-primary font-medium' : 'text-text-secondary dark:text-dark-text-secondary group-hover/item:text-text-primary dark:group-hover/item:text-dark-text-primary'
                                }`}>
                                  {item.label}
                                </span>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 rounded-lg bg-primary/0 group-hover/item:bg-primary/5 dark:group-hover/item:bg-dark-primary/5 transition-all duration-300"></div>
                              </motion.div>
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border dark:border-dark-border bg-surface/50 dark:bg-dark-surface/50 flex-shrink-0">
          <div className="p-3">
            {/* User Info */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} mb-3`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-white" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text-primary dark:text-dark-text-primary truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary truncate">{user?.role || 'Admin'}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-1 ${isCollapsed ? 'flex-col items-center' : 'flex-row'}`}>
              <button
                onClick={toggleTheme}
                className={`group p-2 rounded-lg bg-surface hover:bg-hover/10 dark:bg-dark-surface dark:hover:bg-dark-hover/10 transition-all ${isCollapsed ? 'w-full' : 'flex-1'}`}
              >
                {theme === 'dark' ? (
                  <Sun size={16} className="text-yellow-400" />
                ) : (
                  <Moon size={16} className="text-blue-300" />
                )}
              </button>

              <button
                onClick={handleLogout}
                className={`group p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 transition-all ${isCollapsed ? 'w-full' : 'flex-1'}`}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}