'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subMonths, addMonths } from 'date-fns'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MonthlyChart({ data }: { data: any[] }) {
  const [viewMode, setViewMode] = useState<'recent' | 'all'>('recent')
  
  if (!data || data.length === 0) return null;

  let displayData = data

  if (viewMode === 'recent') {
    const now = new Date()
    const lastMonthKey = format(subMonths(now, 1), 'yyyy-MM')
    const thisMonthKey = format(now, 'yyyy-MM')
    const nextMonthKey = format(addMonths(now, 1), 'yyyy-MM')
    const allowedKeys = [lastMonthKey, thisMonthKey, nextMonthKey]
    
    // Filter data to only show these 3 months
    displayData = data.filter(d => allowedKeys.includes(d.sortKey))
    
    // If we want to guarantee the 3 months show up even if empty:
    allowedKeys.forEach(key => {
      if (!displayData.find(d => d.sortKey === key)) {
        displayData.push({
          sortKey: key,
          month: format(new Date(key + '-02'), 'MMM yyyy'), // quick hack to get month name
          income: 0,
          cost: 0
        })
      }
    })
    
    displayData.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 h-80 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-slate-900">Monthly Overview</h2>
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('recent')}
            className={`text-xs px-2 py-1 rounded-md font-semibold transition-all ${viewMode === 'recent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            3 Months
          </button>
          <button 
            onClick={() => setViewMode('all')}
            className={`text-xs px-2 py-1 rounded-md font-semibold transition-all ${viewMode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            All Time
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              tickFormatter={(val) => `₹${val / 1000}k`}
              width={50}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: unknown) => {
                if (typeof value === 'number') return [`₹${value.toLocaleString()}`, undefined]
                return [value as string, undefined]
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
            <Bar dataKey="income" name="Income" fill="#0f172a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cost" name="Worker Cost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}