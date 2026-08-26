import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-slate-900" />
      <p className="text-sm font-medium animate-pulse">Loading...</p>
    </div>
  )
}
