'use client'

import { useState } from 'react'
import { toggleClientPaymentStatus } from './actions'
import { Loader2, CheckCircle2, Circle } from 'lucide-react'

export default function ToggleClientPaymentStatus({ workId, initialStatus }: { workId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus || 'unpaid')
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const newStatus = await toggleClientPaymentStatus(workId, status)
    setStatus(newStatus)
    setIsLoading(false)
  }

  const isPaid = status === 'paid'

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`w-full mt-4 p-3 rounded-xl flex items-center justify-between border transition-all ${isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
    >
      <div className="flex items-center space-x-3">
        {isPaid ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
        <span className="font-bold text-sm">
          {isPaid ? 'Payment Received from Client' : 'Mark Payment as Received'}
        </span>
      </div>
      {isLoading && <Loader2 className="w-4 h-4 animate-spin opacity-50" />}
    </button>
  )
}
