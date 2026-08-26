'use client'
import { Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button type="submit" disabled={pending} className="w-full flex items-center justify-center bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100">
      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Work'}
    </button>
  )
}
