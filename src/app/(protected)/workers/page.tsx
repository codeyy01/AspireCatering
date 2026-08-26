import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, IndianRupee } from 'lucide-react'
import WorkersList from './WorkersList'

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const supabase = createClient()
  const filter = searchParams.filter || 'active'
  
  const { data: workers } = await supabase
    .from('workers')
    .select('*')
    .eq('active', filter === 'active')
    .order('name')

  return (
    <div className="space-y-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Workers</h1>
        <Link 
          href="/workers/new"
          className="bg-slate-900 text-white p-2 rounded-full shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex space-x-2">
        <Link href="/workers?filter=active" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'active' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
          Active
        </Link>
        <Link href="/workers?filter=inactive" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'inactive' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
          Inactive
        </Link>
      </div>

      <div className="mt-4">
        <WorkersList workers={workers || []} />
      </div>
    </div>
  )
}
