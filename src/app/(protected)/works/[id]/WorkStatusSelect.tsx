'use client'

import { useState } from 'react'
import { updateWorkStatus } from './actions'
import { Loader2 } from 'lucide-react'

export default function WorkStatusSelect({ 
  workId, 
  initialStatus 
}: { 
  workId: string, 
  initialStatus: string 
}) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setIsLoading(true)
    await updateWorkStatus(workId, newStatus)
    setIsLoading(false)
  }

  // Define colors based on status for the select background
  const colors: Record<string, string> = {
    upcoming: 'bg-amber-100 text-amber-700',
    ongoing: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={handleChange}
        disabled={isLoading}
        className={`appearance-none outline-none text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide cursor-pointer transition-colors ${colors[status] || colors.upcoming} ${isLoading ? 'opacity-50' : ''}`}
        style={{ paddingRight: '2rem' }}
      >
        <option value="upcoming">Upcoming</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin text-current opacity-70" />
        ) : (
          <svg className="w-3 h-3 text-current opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        )}
      </div>
    </div>
  )
}
