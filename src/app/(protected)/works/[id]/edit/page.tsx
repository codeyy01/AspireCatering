'use client'

import { updateWork } from './actions'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function EditWorkPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [work, setWork] = useState<any>(null)

  useEffect(() => {
    async function fetchWork() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data, error } = await supabase.from('works').select('*').eq('id', params.id).single()
      if (data) {
        setWork(data)
      } else if (error) {
        setErrorMsg('Failed to load work details')
      }
      setInitialLoading(false)
    }
    fetchWork()
  }, [params.id])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    try {
      const result = await updateWork(params.id, formData)
      if (result?.error) {
        setErrorMsg(result.error)
        setLoading(false)
      } else if (result?.success) {
        router.push(`/works/${params.id}`)
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('Something went wrong')
      }
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center space-x-3 mb-6">
        <Link href={`/works/${params.id}`} className="p-2 bg-white rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Edit Work</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
            {errorMsg}
          </div>
        )}
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
          <input name="title" defaultValue={work?.title} type="text" placeholder="e.g. Menon Wedding" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Date *</label>
          <input required name="event_date" defaultValue={work?.event_date} type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Name</label>
            <input name="client_name" defaultValue={work?.client_name || ''} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Phone</label>
            <input name="client_phone" defaultValue={work?.client_phone || ''} type="tel" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Venue *</label>
          <input required name="venue" defaultValue={work?.venue || ''} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Amount (₹)</label>
            <input name="total_amount" defaultValue={work?.total_amount || ''} type="number" step="0.01" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workers Count *</label>
            <input required name="guest_count" defaultValue={work?.guest_count || ''} type="number" placeholder="No. of workers" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Referred By</label>
          <input name="referred_by" defaultValue={work?.referred_by || ''} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</label>
          <textarea name="notes" defaultValue={work?.notes || ''} rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"></textarea>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Work'}
          </button>
        </div>
      </form>
    </div>
  )
}
