import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, IndianRupee } from 'lucide-react'
import { assignWorkers } from './actions'
import { notFound } from 'next/navigation'

export default async function AssignWorkersPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: work } = await supabase.from('works').select('title').eq('id', params.id).single()
  if (!work) notFound()

  // Get active workers not already assigned
  const { data: existingAssignments } = await supabase
    .from('work_assignments')
    .select('worker_id')
    .eq('work_id', params.id)
    
  const assignedWorkerIds = existingAssignments?.map(a => a.worker_id) || []

  let query = supabase.from('workers').select('*').eq('active', true)
  
  if (assignedWorkerIds.length > 0) {
    query = query.not('id', 'in', `(${assignedWorkerIds.join(',')})`)
  }

  const { data: workers } = await query

  const assignAction = assignWorkers.bind(null, params.id)

  return (
    <div className="space-y-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center space-x-3 mb-6">
        <Link href={`/works/${params.id}`} className="p-2 bg-white rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assign Workers</h1>
          <p className="text-xs text-slate-500 truncate">{work.title}</p>
        </div>
      </div>

      <form action={assignAction} className="space-y-4">
        {(!workers || workers.length === 0) ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No available workers to assign.
          </div>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {workers.map((worker, index) => (
                <div key={worker.id} className={`p-4 ${index !== workers.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <div className="pt-1">
                      <input 
                        type="checkbox" 
                        name={`worker_${worker.id}`} 
                        className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{worker.name}</div>
                      <div className="text-xs text-slate-500 capitalize mb-2">{worker.role || 'Worker'}</div>
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          name={`amount_${worker.id}`}
                          defaultValue={worker.default_rate}
                          className="w-24 px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            
            <div className="pt-4 sticky bottom-[72px]">
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 active:scale-95 shadow-lg transition-transform">
                Assign Selected Workers
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
