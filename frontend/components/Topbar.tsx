'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Moon, Sun } from 'lucide-react'

export default function Topbar() {
  const [user, setUser] = useState<any>(null)
  const [darkMode, setDarkMode] = useState(false)
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    // Implement dark mode toggle logic
  }

  return (
    <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-lilac-dark">Dashboard</h2>
      <div className="flex items-center space-x-4">
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <span className="text-gray-700">{user?.name}</span>
        <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  )
}