'use client'

import { useState } from 'react'
import { togglePaidStatus } from './actions'
import { Loader2 } from 'lucide-react'

export default function TogglePaidStatus({ 
  assignmentId, 
  initialStatus 
}: { 
  assignmentId: string, 
  initialStatus: string 
}) {
  const [status, setStatus] = useState(initialStatus || 'unpaid')
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const newStatus = await togglePaidStatus(assignmentId, status)
    setStatus(newStatus)
    setIsLoading(false)
  }

  const isPaid = status === 'paid'
  const isPartial = status === 'partial'

  const colorClass = isPaid ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 
                     isPartial ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 
                     'bg-red-100 text-red-700 hover:bg-red-200'

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`mt-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center justify-center min-w-[72px] ${colorClass} ${isLoading ? 'opacity-50' : ''}`}
      title="Tap to toggle paid status"
    >
      {status}
      {isLoading && <Loader2 className="w-3 h-3 ml-1.5 animate-spin" />}
    </button>
  )
}
