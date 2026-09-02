import { createClient } from '@/utils/supabase/server'
import { BarChart3, TrendingUp } from 'lucide-react'
import MonthlyChart from './MonthlyChart'
import { format, parseISO } from 'date-fns'

export default async function StatsPage() {
  const supabase = createClient()
  
  // Aggregate stats
  const { data: works } = await supabase.from('works').select('id, total_amount, status, event_date')
  const { data: assignments } = await supabase.from('work_assignments').select('agreed_amount, amount_paid, works(event_date)')

  let totalIncome = 0
  let completedIncome = 0
  let totalWorkerCost = 0
  let totalPaidOut = 0
  
  const monthlyDataMap: Record<string, { month: string, income: number, cost: number, sortKey: string }> = {}

  works?.forEach(w => {
    if (w.status !== 'cancelled') totalIncome += Number(w.total_amount || 0)
    if (w.status === 'completed') completedIncome += Number(w.total_amount || 0)
    
    if (w.event_date && w.status !== 'cancelled') {
      const date = parseISO(w.event_date)
      const monthKey = format(date, 'MMM yyyy')
      const sortKey = format(date, 'yyyy-MM')
      if (!monthlyDataMap[monthKey]) {
        monthlyDataMap[monthKey] = { month: monthKey, income: 0, cost: 0, sortKey }
      }
      monthlyDataMap[monthKey].income += Number(w.total_amount || 0)
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignments?.forEach((a: any) => {
    totalWorkerCost += Number(a.agreed_amount || 0)
    totalPaidOut += Number(a.amount_paid || 0)
    
    if (a.works?.event_date) {
      const date = parseISO(a.works.event_date)
      const monthKey = format(date, 'MMM yyyy')
      const sortKey = format(date, 'yyyy-MM')
      if (!monthlyDataMap[monthKey]) {
        monthlyDataMap[monthKey] = { month: monthKey, income: 0, cost: 0, sortKey }
      }
      monthlyDataMap[monthKey].cost += Number(a.agreed_amount || 0)
    }
  })

  const profit = totalIncome - totalWorkerCost
  const pendingWorkerDues = totalWorkerCost - totalPaidOut
  
  // Sort monthly data chronologically (oldest to newest)
  const monthlyChartData = Object.values(monthlyDataMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  return (
    <div className="space-y-6 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center space-x-2">
        <BarChart3 className="w-6 h-6 text-slate-900" />
        <h1 className="text-2xl font-bold text-slate-900">Statistics</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">Expected Profit</div>
            <div className="text-3xl font-bold">₹{profit.toLocaleString()}</div>
            <div className="text-xs text-slate-300 mt-2">Based on all non-cancelled works</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Income</div>
            <div className="text-xl font-bold text-slate-900">₹{totalIncome.toLocaleString()}</div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
            <div className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-1">Collected</div>
            <div className="text-xl font-bold text-emerald-950">₹{completedIncome.toLocaleString()}</div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Worker Cost</div>
            <div className="text-xl font-bold text-slate-900">₹{totalWorkerCost.toLocaleString()}</div>
          </div>
          
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
            <div className="text-xs text-red-700 uppercase tracking-wider font-semibold mb-1">Pending Dues</div>
            <div className="text-xl font-bold text-red-950">₹{pendingWorkerDues.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      <MonthlyChart data={monthlyChartData} />

      <div className="pt-4">
        <a 
          href="/api/export" 
          download="catering_backup.csv"
          className="w-full flex items-center justify-center bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-md hover:bg-slate-800 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Download Backup (CSV)
        </a>
      </div>
    </div>
  )
}
