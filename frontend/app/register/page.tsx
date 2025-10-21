'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { UserPlus, User, Wrench, Crown, Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('penyewa')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:8080/register', {
        name,
        email,
        password,
        role,
      })
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      alert('Register gagal. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20 dark:border-slate-700/20 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Registrasi Berhasil!
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Akun Anda telah berhasil dibuat. Mengalihkan ke halaman login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      {/* Back to Login Link */}
      <Link
        href="/login"
        className="absolute top-6 left-6 group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        Kembali ke Login
      </Link>

      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20 dark:border-slate-700/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Bergabunglah dengan sistem manajemen kos modern
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                placeholder="user@example.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Pilih Role Anda
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole('penyewa')}
                className={`group py-4 px-3 rounded-xl font-medium transition-all duration-200 flex flex-col items-center gap-2 ${
                  role === 'penyewa'
                    ? 'bg-green-500 text-white shadow-lg transform scale-105'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 hover:scale-105'
                }`}
              >
                <User className={`w-5 h-5 ${role === 'penyewa' ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
                <span className="text-xs">Penyewa</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('pengelola')}
                className={`group py-4 px-3 rounded-xl font-medium transition-all duration-200 flex flex-col items-center gap-2 ${
                  role === 'pengelola'
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105'
                }`}
              >
                <Wrench className={`w-5 h-5 ${role === 'pengelola' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                <span className="text-xs">Pengelola</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`group py-4 px-3 rounded-xl font-medium transition-all duration-200 flex flex-col items-center gap-2 ${
                  role === 'admin'
                    ? 'bg-red-500 text-white shadow-lg transform scale-105'
                    : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 hover:scale-105'
                }`}
              >
                <Crown className={`w-5 h-5 ${role === 'admin' ? 'text-white' : 'text-red-600 dark:text-red-400'}`} />
                <span className="text-xs">Admin</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
            <span className="relative">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Membuat Akun...
                </div>
              ) : (
                'Buat Akun'
              )}
            </span>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}