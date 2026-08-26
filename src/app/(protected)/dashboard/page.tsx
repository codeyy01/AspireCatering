import { createClient } from '@/utils/supabase/server'
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns'
import Link from 'next/link'
import { IndianRupee, Briefcase, AlertCircle, ChevronRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  
  // 1. Total income this month (from works table)
  const { data: worksThisMonth } = await supabase
    .from('works')
    .select('total_amount, status')
    .gte('event_date', monthStart.toISOString())
    .lte('event_date', monthEnd.toISOString())
    .not('status', 'eq', 'cancelled')
    
  const totalIncome = worksThisMonth?.reduce((sum, w) => sum + Number(w.total_amount || 0), 0) || 0
  const worksCount = worksThisMonth?.length || 0

  // 2. Total pending dues to workers (from work_assignments joined with workers)
  const { data: pendingAssignments } = await supabase
    .from('work_assignments')
    .select(`
      agreed_amount, 
      amount_paid,
      worker_id,
      workers (name)
    `)
    .in('paid_status', ['unpaid', 'partial'])
    
  let totalPending = 0
  const workerOwedMap: Record<string, { name: string; amount: number }> = {}
  
  pendingAssignments?.forEach(assignment => {
    const owed = Number(assignment.agreed_amount || 0) - Number(assignment.amount_paid || 0)
    totalPending += owed
    
    if (owed > 0 && assignment.workers) {
      const wId = assignment.worker_id
      // @ts-expect-error Supabase types are not fully inferred here
      const wName = assignment.workers.name
      if (!workerOwedMap[wId]) {
        workerOwedMap[wId] = { name: wName, amount: 0 }
      }
      workerOwedMap[wId].amount += owed
    }
  })
  
  const pendingWorkers = Object.entries(workerOwedMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.amount - a.amount)

  // 3. Upcoming works (next 14 days)
  const next14Days = addDays(now, 14)
  const { data: upcomingWorks } = await supabase
    .from('works')
    .select('id, title, event_date, status')
    .gte('event_date', now.toISOString())
    .lte('event_date', next14Days.toISOString())
    .not('status', 'eq', 'cancelled')
    .order('event_date', { ascending: true })
    .limit(5)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-emerald-700 mb-1">
            <IndianRupee className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Income</span>
          </div>
          <span className="text-xl font-bold text-emerald-950">₹{totalIncome.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-600 font-medium">This Month</span>
        </div>
        
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-red-700 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
          </div>
          <span className="text-xl font-bold text-red-950">₹{totalPending.toLocaleString()}</span>
          <span className="text-[10px] text-red-600 font-medium">Worker Dues</span>
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{worksCount} Works</p>
            <p className="text-xs text-slate-500">Scheduled this month</p>
          </div>
        </div>
      </div>

      {/* Upcoming Works */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Upcoming Works</h2>
          <Link href="/works" className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center">
            View All <ChevronRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
        
        {(!upcomingWorks || upcomingWorks.length === 0) ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-sm">
            No upcoming works in the next 14 days.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingWorks.map(work => (
              <Link key={work.id} href={`/works/${work.id}`} className="block bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">{work.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{format(new Date(work.event_date), 'EEE, MMM d, yyyy')}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide
                    ${work.status === 'upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}
                  `}>
                    {work.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pending Worker Payments */}
      <div>
        <h2 className="font-bold text-slate-900 mb-3">Pending Worker Dues</h2>
        {pendingWorkers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-sm flex flex-col items-center">
            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2">
              <IndianRupee className="w-5 h-5" />
            </div>
            All workers are fully paid!
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {pendingWorkers.map((worker, index) => (
              <Link key={worker.id} href={`/workers/${worker.id}`} className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${index !== pendingWorkers.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-900">{worker.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">₹{worker.amount.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
    </div>
  )
}
