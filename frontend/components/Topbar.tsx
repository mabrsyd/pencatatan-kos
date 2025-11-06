'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import NotificationCenter from './NotificationCenter'

export default function Topbar() {
  const [user, setUser] = useState<any>(null)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-900 dark:via-purple-900 dark:to-indigo-900"></div>

      {/* Glassmorphism Overlay */}
      <div className="relative backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border-b border-white/20 dark:border-gray-700/20">
        <div className="px-6 py-4 flex justify-between items-center">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <h2 className="text-xl font-bold text-white hidden sm:block">Dashboard</h2>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Notification Center */}
            <div className="text-white">
              <NotificationCenter />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="group relative p-3 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-gray-800/10 dark:hover:bg-gray-700/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-400 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
              ) : (
                <Moon size={20} className="text-blue-300 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
              )}
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3 bg-white/10 dark:bg-gray-800/10 rounded-xl px-4 py-2 backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-white font-medium hidden sm:block">{user?.name}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="group relative p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <LogOut size={20} className="text-red-300 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}