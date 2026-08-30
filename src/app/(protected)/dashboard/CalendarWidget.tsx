'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'

type Work = {
  id: string
  title: string
  event_date: string
  status: string
  total_amount?: number
  guest_count?: number
  work_assignments?: { count: number }[]
}

export default function CalendarWidget({ works }: { works: Work[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const dateFormat = "MMMM yyyy"
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const selectedDateWorks = works.filter(work => isSameDay(new Date(work.event_date), selectedDate))

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {format(currentDate, dateFormat)}
          </h2>
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-3">
          <div className="grid grid-cols-7 mb-2">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dateWorks = works.filter(w => isSameDay(new Date(w.event_date), day))
              
              const isSelected = isSameDay(day, selectedDate)
              const isCurrentMonth = isSameMonth(day, monthStart)
              const isDayToday = isToday(day)

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm font-medium transition-all
                    ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                    ${isSelected ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-50'}
                    ${isDayToday && !isSelected ? 'text-blue-600 font-bold bg-blue-50' : ''}
                  `}
                >
                  <span>{format(day, 'd')}</span>
                  
                  {/* Event Dots */}
                  {dateWorks.length > 0 && (
                    <div className="flex gap-0.5 mt-1 absolute bottom-1.5">
                      {dateWorks.map((work, i) => {
                        let dotColor = 'bg-slate-400'
                        if (work.status === 'upcoming') dotColor = 'bg-blue-400'
                        if (work.status === 'ongoing') dotColor = 'bg-amber-400'
                        if (work.status === 'completed') dotColor = 'bg-emerald-400'
                        
                        return (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        )
                      })}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Works */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-800">
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
          </h3>
          <Link 
            href={`/works/new?date=${format(selectedDate, 'yyyy-MM-dd')}`}
            className="bg-slate-900 text-white p-1.5 rounded-full shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
        
        {selectedDateWorks.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 text-center text-slate-500 text-sm">
            No works scheduled for this date.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateWorks.map(work => {
              let statusColor = 'text-blue-600 bg-blue-50'
              if (work.status === 'ongoing') statusColor = 'text-amber-600 bg-amber-50'
              if (work.status === 'completed') statusColor = 'text-emerald-600 bg-emerald-50'

              const isPaid = work.status === 'completed' && work.client_payment_status === 'paid'
              const containerClass = isPaid 
                ? 'bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center'
                : 'bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center'

              return (
                <Link key={work.id} href={`/works/${work.id}`} className="block">
                  <div className={containerClass}>
                    <div>
                      <h4 className="font-bold text-slate-900">{work.title}</h4>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {work.status}
                        </div>
                        <div className="flex items-center text-xs font-medium text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          {work.work_assignments?.[0]?.count || 0} / {work.guest_count || 0}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {work.total_amount ? (
                        <div className="font-bold text-slate-900">₹{Number(work.total_amount).toLocaleString()}</div>
                      ) : null}
                      <ChevronRight className="w-4 h-4 text-slate-400 inline-block mt-1" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
