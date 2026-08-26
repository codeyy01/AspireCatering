import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, IndianRupee } from 'lucide-react'

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

      <div className="space-y-3 mt-4">
        {(!workers || workers.length === 0) ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No workers found.
          </div>
        ) : (
          workers.map(worker => (
            <Link key={worker.id} href={`/workers/${worker.id}`} className="block bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{worker.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{worker.role || 'Worker'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 flex items-center justify-end">
                    <IndianRupee className="w-3 h-3 mr-0.5" />
                    {Number(worker.default_rate || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Rate</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
