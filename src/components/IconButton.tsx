'use client'
import { Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import React from 'react'

export function IconButton({ icon: Icon, variant = 'danger' }: { icon: React.ElementType, variant?: 'danger' | 'primary' }) {
  const { pending } = useFormStatus()
  
  if (variant === 'danger') {
    return (
      <button type="submit" disabled={pending} className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
        {pending ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Icon className="w-4 h-4" />}
      </button>
    )
  }

  return (
    <button type="submit" disabled={pending} className="text-blue-500 p-1.5 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50">
      {pending ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Icon className="w-4 h-4" />}
    </button>
  )
}
