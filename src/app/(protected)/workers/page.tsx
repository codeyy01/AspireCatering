import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import WorkersList from './WorkersList'

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const supabase = createClient()
  const filter = searchParams.filter || 'unpaid'
  
  const { data: rawWorkers } = await supabase
    .from('workers')
    .select('*, work_assignments(agreed_amount, amount_paid, paid_status)')
    .order('name')

  let workers = (rawWorkers || []).map(w => {
    let pending = 0
    w.work_assignments?.forEach((a: { agreed_amount: number | null, amount_paid: number | null }) => {
      pending += (Number(a.agreed_amount || 0) - Number(a.amount_paid || 0))
    })
    return { ...w, pendingAmount: pending }
  })

  if (filter === 'paid') {
    workers = workers.filter(w => w.pendingAmount <= 0)
  } else if (filter === 'unpaid') {
    workers = workers.filter(w => w.pendingAmount > 0)
  }

  return (
    <div className="space-y-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out relative min-h-screen">
      <div className="flex justify-between items-center mt-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workers</h1>
      </div>

      <div className="flex space-x-2 pb-2">
        <Link href="/workers?filter=unpaid" className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-all ${filter === 'unpaid' ? 'bg-rose-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
          Unpaid
        </Link>
        <Link href="/workers?filter=paid" className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-all ${filter === 'paid' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
          Paid
        </Link>
        <Link href="/workers?filter=all" className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-all ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
          All
        </Link>
      </div>

      <WorkersList workers={workers} />
      
      <Link 
        href="/workers/new"
        className="fixed bottom-24 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  )
}
