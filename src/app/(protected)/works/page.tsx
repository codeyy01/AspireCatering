import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'
import { Plus, MapPin, IndianRupee } from 'lucide-react'

export default async function WorksPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const statusFilter = searchParams.status || 'upcoming'
  
  let query = supabase.from('works').select('*, work_assignments(count)').order('event_date', { ascending: statusFilter === 'upcoming' })
  
  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: works } = await query

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
    { id: 'all', label: 'All' },
  ]

  return (
    <div className="space-y-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Works</h1>
        <Link 
          href="/works/new"
          className="bg-slate-900 text-white p-2 rounded-full shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            href={`/works?status=${tab.id}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.id 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Works List */}
      <div className="space-y-3 mt-4">
        {(!works || works.length === 0) ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No works found.
          </div>
        ) : (
          works.map(work => (
            <Link key={work.id} href={`/works/${work.id}`} className="block bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900 text-lg">{work.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide
                  ${work.status === 'upcoming' ? 'bg-amber-100 text-amber-700' : ''}
                  ${work.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : ''}
                  ${work.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                  ${work.status === 'cancelled' ? 'bg-slate-100 text-slate-700' : ''}
                `}>
                  {work.status}
                </span>
              </div>
              
              <div className="flex flex-col space-y-1 mt-3">
                <div className="flex items-center text-sm text-slate-600">
                  <div className="w-5 flex justify-center mr-2"><MapPin className="w-4 h-4 text-slate-400" /></div>
                  <span className="truncate">{work.venue || 'No venue'}</span>
                </div>
                
                <div className="flex items-center text-sm text-slate-600">
                  <div className="w-5 flex justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <span className="font-medium text-slate-700">
                    {/* @ts-expect-error count property from supabase join */}
                    Workers: {work.work_assignments?.[0]?.count || 0} / {work.guest_count || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                  <div className="text-sm font-medium text-slate-900">
                    {format(new Date(work.event_date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center text-sm font-bold text-slate-900">
                    <IndianRupee className="w-3 h-3 mr-0.5" />
                    {Number(work.total_amount || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
