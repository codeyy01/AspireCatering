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

  const colorClass = isPaid ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50' : 
                     isPartial ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' : 
                     'text-red-400 hover:text-red-500 hover:bg-red-50'

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`text-[9px] font-bold uppercase tracking-wider px-1 -mx-1 py-0.5 rounded transition-colors cursor-pointer flex items-center justify-end ${colorClass} ${isLoading ? 'opacity-50' : ''}`}
      title="Tap to toggle paid status"
    >
      {status}
      {isLoading && <Loader2 className="w-2.5 h-2.5 ml-1 animate-spin" />}
    </button>
  )
}
