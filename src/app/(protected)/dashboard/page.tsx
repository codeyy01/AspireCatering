import { createClient } from '@/utils/supabase/server'
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { IndianRupee, Briefcase } from 'lucide-react'
import CalendarWidget from './CalendarWidget'

import { syncWorkStatuses } from '@/utils/syncStatus'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Auto-sync statuses based on dates
  await syncWorkStatuses()

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

  // 2. Fetch all works for the calendar (spanning a generous 6 month window)
  const calendarStart = subMonths(now, 2)
  const calendarEnd = addMonths(now, 4)
  
  const { data: calendarWorks } = await supabase
    .from('works')
    .select('id, title, event_date, status, total_amount, guest_count, work_assignments(count)')
    .gte('event_date', calendarStart.toISOString())
    .lte('event_date', calendarEnd.toISOString())
    .not('status', 'eq', 'cancelled')

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-emerald-700 mb-1">
            <IndianRupee className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Income</span>
          </div>
          <span className="text-2xl font-black text-emerald-950">₹{totalIncome.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-600 font-bold uppercase mt-1">This Month</span>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-blue-700 mb-1">
            <Briefcase className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Works</span>
          </div>
          <span className="text-2xl font-black text-blue-950">{worksCount}</span>
          <span className="text-[10px] text-blue-600 font-bold uppercase mt-1">Scheduled This Month</span>
        </div>
      </div>

      <CalendarWidget works={calendarWorks || []} />
    </div>
  )
}
