import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { assignWorkers } from './actions'
import { notFound } from 'next/navigation'
import { SubmitButton } from '@/components/SubmitButton'

export default async function AssignWorkersPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: work } = await supabase.from('works').select('title').eq('id', params.id).single()
  if (!work) notFound()

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

      <form action={assignAction} className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Worker Names</label>
          <p className="text-xs text-slate-500">Type names separated by commas or on new lines. New names will be automatically added to your workforce.</p>
          <textarea 
            name="worker_names" 
            required 
            rows={5} 
            placeholder="Rahul, Kumar, Aswin..." 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Wage / Amount (₹) per worker</label>
          <input 
            name="agreed_amount" 
            type="number" 
            placeholder="e.g. 500" 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
