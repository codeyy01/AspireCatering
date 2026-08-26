import { login } from './actions'
import { Utensils } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 text-center bg-slate-900 text-white">
          <Utensils className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
          <h1 className="text-2xl font-bold">Catering Tracker</h1>
          <p className="text-slate-400 text-sm mt-2">Manage your works and team</p>
        </div>
        
        <form className="p-8 space-y-6" action={login}>
          {searchParams?.error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
              {searchParams.error}
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
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors active:scale-95"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
