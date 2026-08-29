import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Users as UsersIcon, Trash2 } from 'lucide-react'
import InlineAssign from './InlineAssign'
import { IconButton } from '@/components/IconButton'
import { removeWorker } from './actions'
import { notFound } from 'next/navigation'

import EditableAssignmentAmount from './EditableAssignmentAmount'
import WorkStatusSelect from './WorkStatusSelect'
import TogglePaidStatus from './TogglePaidStatus'

export default async function WorkDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: work } = await supabase
    .from('works')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!work) notFound()

  const { data: assignments } = await supabase
    .from('work_assignments')
    .select('*, workers(id, name, role)')
    .eq('work_id', params.id)

  type Assignment = typeof assignments extends (infer U)[] | null ? NonNullable<U> : never;
  type GroupedAssignment = Assignment & {
    headcount: number;
    total_agreed_amount: number;
    assignment_ids: string[];
  };

  const groupedAssignmentsMap = (assignments || []).reduce((acc: Record<string, GroupedAssignment>, assignment) => {
    const wid = assignment.worker_id
    if (!wid) return acc
    if (!acc[wid]) {
      acc[wid] = {
        ...assignment,
        headcount: 1,
        total_agreed_amount: Number(assignment.agreed_amount || 0),
        assignment_ids: [assignment.id]
      }
    } else {
      acc[wid].headcount += 1
      acc[wid].total_agreed_amount += Number(assignment.agreed_amount || 0)
      acc[wid].assignment_ids.push(assignment.id)
      // If any is unpaid, mark group as unpaid
      if (assignment.paid_status === 'unpaid' || acc[wid].paid_status === 'unpaid') {
        acc[wid].paid_status = 'unpaid'
      } else if (assignment.paid_status === 'partial') {
        acc[wid].paid_status = 'partial'
      }
    }
    return acc
  }, {})

  const groupedAssignments = Object.values(groupedAssignmentsMap)

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link href="/works" className="p-2 bg-white rounded-full shadow-sm border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 truncate max-w-[200px]">{work.title}</h1>
        </div>
        <Link href={`/works/${work.id}/edit`} className="text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
          Edit
        </Link>
      </div>

      {/* Work Details Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold text-slate-900">₹{Number(work.total_amount || 0).toLocaleString()}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Total Amount</div>
          </div>
          <WorkStatusSelect workId={work.id} initialStatus={work.status || 'upcoming'} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-500 mb-1">Date</div>
            <div className="text-sm font-medium text-slate-900">{format(new Date(work.event_date), 'MMM d, yyyy')}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Guests</div>
            <div className="text-sm font-medium text-slate-900">{work.guest_count || 'N/A'}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-slate-500 mb-1">Venue</div>
            <div className="text-sm font-medium text-slate-900 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-slate-400" /> {work.venue || 'N/A'}
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-slate-500 mb-1">Client</div>
            <div className="text-sm font-medium text-slate-900">{work.client_name || 'N/A'}</div>
            {work.client_phone && (
              <a href={`tel:${work.client_phone}`} className="text-blue-600 flex items-center mt-1 text-sm">
                <Phone className="w-4 h-4 mr-1" /> {work.client_phone}
              </a>
            )}
          </div>
          {work.notes && (
            <div className="col-span-2">
              <div className="text-xs text-slate-500 mb-1">Notes</div>
              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{work.notes}</div>
            </div>
          )}
        </div>
      </div>

      {/* Workers Section */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <UsersIcon className="w-5 h-5 mr-2" />
            Assigned Workers ({assignments?.length || 0})
          </h2>
        </div>
        
        <div className="mb-4">
          <InlineAssign workId={work.id} />
        </div>

        <div>
          {(!groupedAssignments || groupedAssignments.length === 0) ? (
            <div className="bg-slate-100 rounded-2xl p-6 text-center text-slate-500 text-sm border border-slate-200 border-dashed">
              No workers assigned yet.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {groupedAssignments.map(assignment => (
                  <div key={assignment.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    
                    <Link href={`/workers/${assignment.worker_id}`} className="flex-1 min-w-0 pr-3">
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {assignment.workers?.name || 'Unknown Worker'}
                        {assignment.headcount > 1 && (
                          <span className="ml-1.5 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs">({assignment.headcount})</span>
                        )}
                      </div>
                      {assignment.workers?.role && !['worker', 'other'].includes(assignment.workers.role.toLowerCase()) && (
                        <div className="text-[10px] text-slate-500 capitalize truncate mt-0.5">{assignment.workers.role}</div>
                      )}
                    </Link>
                    
                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right flex flex-col items-end">
                        <EditableAssignmentAmount 
                          assignmentId={assignment.assignment_ids} 
                          initialAmount={assignment.total_agreed_amount} 
                        />
                        <TogglePaidStatus 
                          assignmentId={assignment.assignment_ids} 
                          initialStatus={assignment.paid_status || 'unpaid'} 
                        />
                      </div>
            
                      <form action={async () => {
                        'use server'
                        await removeWorker(assignment.assignment_ids, work.id)
                      }}>
                        <IconButton variant="danger">
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </form>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
