import { createWorker } from './actions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewWorkerPage() {
  return (
    <div className="space-y-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center space-x-3 mb-6">
        <Link href="/workers" className="p-2 bg-white rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Add New Worker</h1>
      </div>

      <form action={createWorker} className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name *</label>
          <input required name="name" type="text" placeholder="e.g. John Doe" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
          <input name="phone" type="tel" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
            <select name="role" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900">
              <option value="cook">Cook</option>
              <option value="helper">Helper</option>
              <option value="server">Server</option>
              <option value="driver">Driver</option>
              <option value="manager">Manager</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Default Rate (₹)</label>
            <input name="default_rate" type="number" step="0.01" defaultValue="0" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 active:scale-95 transition-all">
            Save Worker
          </button>
        </div>
      </form>
    </div>
  )
}
