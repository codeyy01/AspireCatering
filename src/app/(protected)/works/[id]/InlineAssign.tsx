'use client'

import { useState } from 'react'
import { UserPlus, Loader2, X } from 'lucide-react'
import { assignWorkers } from './assign/actions'

export default function InlineAssign({ workId }: { workId: string }) {
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await assignWorkers(workId, formData)
      if (result?.error) {
        setErrorMsg(result.error)
      } else {
        // Success
        setIsAdding(false)
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('Something went wrong')
      }
    }
    setLoading(false)
  }

  if (!isAdding) {
    return (
      <button 
        onClick={() => setIsAdding(true)} 
        className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
      >
        <UserPlus className="w-4 h-4 mr-1" /> Add
      </button>
    )
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full relative animate-in fade-in slide-in-from-top-2 duration-300">
      <button 
        onClick={() => setIsAdding(false)} 
        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <h3 className="font-semibold text-slate-800 mb-3 text-sm">Add Workers</h3>
      
      <form onSubmit={onSubmit} className="space-y-3">
        {errorMsg && (
          <div className="p-2 bg-red-50 text-red-600 text-xs rounded text-center">
            {errorMsg}
          </div>
        )}
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">Worker Names (comma separated)</label>
          <textarea 
            name="worker_names" 
            required 
            rows={2} 
            placeholder="Rahul, Kumar..." 
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          ></textarea>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">Wage (₹)</label>
          <input 
            name="agreed_amount" 
            type="number" 
            defaultValue="500"
            placeholder="e.g. 500" 
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center bg-slate-900 text-white font-bold py-2 rounded-xl text-sm hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Assign'}
        </button>
      </form>
    </div>
  )
}
