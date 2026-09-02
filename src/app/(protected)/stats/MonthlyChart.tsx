'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MonthlyChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 h-72">
      <h2 className="text-sm font-bold text-slate-900 mb-4">Monthly Overview</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill="#0f172a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="cost" name="Worker Cost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}