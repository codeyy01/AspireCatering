import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Users as UsersIcon, UserPlus, Trash2 } from 'lucide-react'
import { updateWorkStatus, removeWorker } from './actions'
import { notFound } from 'next/navigation'

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

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <Link href="/works" className="p-2 bg-white rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 truncate flex-1">{work.title}</h1>
      </div>

      {/* Work Details Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold text-slate-900">₹{Number(work.total_amount || 0).toLocaleString()}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Total Amount</div>
          </div>
          <form action={async () => {
            'use server'
            const nextStatus = work.status === 'upcoming' ? 'ongoing' : work.status === 'ongoing' ? 'completed' : 'upcoming'
            await updateWorkStatus(work.id, nextStatus)
          }}>
            <button type="submit" className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide transition-colors
              ${work.status === 'upcoming' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : ''}
              ${work.status === 'ongoing' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
              ${work.status === 'completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}
              ${work.status === 'cancelled' ? 'bg-slate-100 text-slate-700' : ''}
            `}>
              {work.status} (Tap to change)
            </button>
          </form>
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
          <Link href={`/works/${work.id}/assign`} className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
            <UserPlus className="w-4 h-4 mr-1" /> Add
          </Link>
        </div>

        <div className="space-y-3">
          {(!assignments || assignments.length === 0) ? (
            <div className="bg-slate-100 rounded-2xl p-6 text-center text-slate-500 text-sm border border-slate-200 border-dashed">
              No workers assigned yet.
            </div>
          ) : (
            assignments.map(assignment => (
              <div key={assignment.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900">{assignment.workers.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{assignment.workers.role || 'Worker'}</div>
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
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                  <Link href={`/workers/${assignment.worker_id}`} className="text-xs font-medium text-slate-600 underline">
                    View Profile
                  </Link>
                  <form action={async () => {
                    'use server'
                    await removeWorker(assignment.id, work.id)
                  }}>
                    <button type="submit" className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
