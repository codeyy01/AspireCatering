import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Phone, Briefcase, CheckCircle2 } from 'lucide-react'
import { markAsPaid } from './actions'
import { notFound } from 'next/navigation'

export default async function WorkerDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!worker) notFound()

  const { data: assignments } = await supabase
    .from('work_assignments')
    .select('*, works(id, title, event_date)')
    .eq('worker_id', params.id)
    .order('created_at', { ascending: false })

  let totalPending = 0
  let totalEarned = 0
  
  assignments?.forEach(a => {
    totalEarned += Number(a.agreed_amount || 0)
    totalPending += (Number(a.agreed_amount || 0) - Number(a.amount_paid || 0))
  })

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <Link href="/workers" className="p-2 bg-white rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 truncate flex-1">Worker Profile</h1>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-3">
          {worker.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{worker.name}</h2>
        <p className="text-sm text-slate-500 capitalize mb-4">{worker.role || 'Worker'}</p>
        
        <div className="flex justify-center space-x-4 mb-4">
          {worker.phone && (
            <a href={`tel:${worker.phone}`} className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
              <Phone className="w-4 h-4 mr-1.5" /> Call
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-left">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Earned</div>
            <div className="text-lg font-bold text-slate-900">₹{totalEarned.toLocaleString()}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-xl border border-red-100">
            <div className="text-xs text-red-600 uppercase tracking-wider mb-1">Pending Dues</div>
            <div className="text-lg font-bold text-red-700">₹{totalPending.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          Work History ({assignments?.length || 0})
        </h2>

        <div className="space-y-3">
          {(!assignments || assignments.length === 0) ? (
            <div className="bg-slate-100 rounded-2xl p-6 text-center text-slate-500 text-sm border border-slate-200 border-dashed">
              No works assigned yet.
            </div>
          ) : (
            assignments.map(assignment => {
              // @ts-expect-error Supabase types are not fully inferred here
              const workTitle = assignment.works?.title || 'Unknown Work'
              // @ts-expect-error Supabase types are not fully inferred here
              const workDate = assignment.works?.event_date
              const owed = Number(assignment.agreed_amount) - Number(assignment.amount_paid)

              return (
                <div key={assignment.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {/* @ts-expect-error Supabase types are not fully inferred here */}
                      <Link href={`/works/${assignment.works?.id}`} className="font-bold text-slate-900 hover:underline">{workTitle}</Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {workDate ? format(new Date(workDate), 'MMM d, yyyy') : 'No date'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{Number(assignment.agreed_amount).toLocaleString()}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${
                        assignment.paid_status === 'paid' ? 'text-emerald-600' :
                        assignment.paid_status === 'partial' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {assignment.paid_status}
                      </div>
                    </div>
                  </div>

                  {owed > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-sm font-medium text-red-600">
                        Owes: ₹{owed.toLocaleString()}
                      </div>
                      <form action={async () => {
                        'use server'
                        await markAsPaid(assignment.id, worker.id, owed)
                      }}>
                        <button type="submit" className="flex items-center text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Pay Full
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
