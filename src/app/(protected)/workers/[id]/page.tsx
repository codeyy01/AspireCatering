import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Phone, Briefcase } from 'lucide-react'
import { notFound } from 'next/navigation'
import TogglePaidStatus from '../../works/[id]/TogglePaidStatus'

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

  type GroupedAssignment = {
    workId: string
    workTitle: string
    workDate: string
    assignmentIds: string[]
    agreedAmount: number
    amountPaid: number
    headcount: number
    paidStatus: string
  }

  const groupedAssignmentsMap = new Map<string, GroupedAssignment>()
  assignments?.forEach(a => {
    if (!a.works?.id) return
    if (!groupedAssignmentsMap.has(a.works.id)) {
      groupedAssignmentsMap.set(a.works.id, {
        workId: a.works.id,
        workTitle: a.works.title,
        workDate: a.works.event_date,
        assignmentIds: [a.id],
        agreedAmount: Number(a.agreed_amount || 0),
        amountPaid: Number(a.amount_paid || 0),
        headcount: 1,
        paidStatus: a.paid_status
      })
    } else {
      const group = groupedAssignmentsMap.get(a.works.id)!
      group.assignmentIds.push(a.id)
      group.agreedAmount += Number(a.agreed_amount || 0)
      group.amountPaid += Number(a.amount_paid || 0)
      group.headcount += 1
      if (a.paid_status !== 'paid') {
        group.paidStatus = 'unpaid' // Mark as unpaid if any is unpaid
      }
    }
  })

  const groupedAssignments = Array.from(groupedAssignmentsMap.values())

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
          Work History ({groupedAssignments.length})
        </h2>

        <div className="space-y-3">
          {(!groupedAssignments || groupedAssignments.length === 0) ? (
            <div className="bg-slate-100 rounded-2xl p-6 text-center text-slate-500 text-sm border border-slate-200 border-dashed">
              No works assigned yet.
            </div>
          ) : (
            groupedAssignments.map(group => {
              return (
                <div key={group.workId} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={`/works/${group.workId}`} className="font-bold text-slate-900 hover:underline flex items-center">
                        {group.workTitle}
                        {group.headcount > 1 && (
                          <span className="ml-2 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                            ({group.headcount} Workers)
                          </span>
                        )}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {group.workDate ? format(new Date(group.workDate), 'MMM d, yyyy') : 'No date'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 mb-1">₹{group.agreedAmount.toLocaleString()}</div>
                      <TogglePaidStatus 
                        assignmentId={group.assignmentIds} 
                        initialStatus={group.paidStatus} 
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
