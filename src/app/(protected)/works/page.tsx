import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { syncWorkStatuses } from '@/utils/syncStatus'
import WorksList from './WorksList'

export default async function WorksPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  
  await syncWorkStatuses()
  
  const statusFilter = searchParams.status || 'upcoming'
  
  const { data: allWorks } = await supabase
    .from('works')
    .select('*, work_assignments(count)')
    .order('event_date', { ascending: false })

  let works = allWorks || []

  if (statusFilter === 'upcoming') {
    works = works.filter(w => w.status !== 'completed' && w.status !== 'cancelled' && (w.work_assignments?.[0]?.count || 0) < (w.guest_count || 0))
  } else if (statusFilter === 'ongoing') {
    works = works.filter(w => w.status !== 'completed' && w.status !== 'cancelled' && (w.work_assignments?.[0]?.count || 0) >= (w.guest_count || 0))
  } else if (statusFilter === 'completed') {
    works = works.filter(w => w.status === 'completed')
  }

  const tabs = [
    { id: 'upcoming', label: 'Needs Workers' },
    { id: 'ongoing', label: 'Workers Filled' },
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
      <WorksList works={works} />
    </div>
  )
}
