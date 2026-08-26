'use client'

import { useState } from 'react'
import { login } from './actions'
import { Utensils, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setErrorMsg('')
    const result = await login(formData)
    if (result?.error) {
      setErrorMsg(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 text-center bg-slate-900 text-white">
          <Utensils className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
          <h1 className="text-2xl font-bold">Catering Tracker</h1>
          <p className="text-slate-400 text-sm mt-2">Manage your works and team</p>
        </div>
        
        <form className="p-8 space-y-6" action={handleSubmit}>
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="owner@example.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
