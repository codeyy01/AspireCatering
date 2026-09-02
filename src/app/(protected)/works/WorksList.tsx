'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { MapPin, IndianRupee, Trash2, Loader2, CheckSquare, Square } from 'lucide-react'
import { deleteWorks } from './actions'

type Work = {
  id: string
  title: string
  status: string
  event_date: string
  venue: string | null
  guest_count: number | null
  total_amount: number | null
  client_payment_status?: string | null
  work_assignments: { count: number }[] | null
}

export default function WorksList({ works }: { works: Work[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all')

  const pressTimer = useRef<NodeJS.Timeout | null>(null)
  const wasLongPress = useRef(false)

  const handlePressStart = (id: string) => {
    wasLongPress.current = false
    pressTimer.current = setTimeout(() => {
      wasLongPress.current = true
      setSelectionMode(true)
      setSelectedIds(prev => {
        const newSet = new Set(prev)
        newSet.add(id)
        return newSet
      })
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50)
      }
    }, 400)
  }

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const filteredWorks = works.filter(w => {
    if (paymentFilter === 'all') return true
    if (paymentFilter === 'paid') return w.client_payment_status === 'paid'
    if (paymentFilter === 'pending') return w.client_payment_status !== 'paid'
    return true
  })

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteWorks(Array.from(selectedIds))
    setSelectedIds(new Set())
    setSelectionMode(false)
    setShowConfirm(false)
    setIsDeleting(false)
  }

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedIds(new Set())
      setSelectionMode(false)
    } else {
      setSelectionMode(true)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mt-6 mb-2">
        <h2 className="text-lg font-bold text-slate-900">All Works ({filteredWorks.length})</h2>
        {filteredWorks.length > 0 && (
          <button 
            onClick={toggleSelectionMode}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1 bg-slate-100 rounded-lg transition-colors"
          >
            {selectionMode ? 'Cancel' : 'Select'}
          </button>
        )}
      </div>
      
      {/* Sub-filter for completed works */}
      {works.length > 0 && works.every(w => w.status === 'completed') && (
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => setPaymentFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${paymentFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setPaymentFilter('paid')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${paymentFilter === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Payment Received
          </button>
          <button 
            onClick={() => setPaymentFilter('pending')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${paymentFilter === 'pending' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Payment Pending
          </button>
        </div>
      )}

      <div className="space-y-6">
        {(!filteredWorks || filteredWorks.length === 0) ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No works found.
          </div>
        ) : (
          (() => {
            const grouped = filteredWorks.reduce((acc, work) => {
              const date = new Date(work.event_date)
              const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' })
              let group = acc.find(g => g.monthYear === monthYear)
              if (!group) {
                group = { monthYear, works: [] }
                acc.push(group)
              }
              group.works.push(work)
              return acc
            }, [] as { monthYear: string; works: Work[] }[])

            return grouped.map(group => (
              <div key={group.monthYear} className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 px-1 pt-2">{group.monthYear}</h3>
                {group.works.map(work => {
                  const isFilled = (work.work_assignments?.[0]?.count || 0) >= (work.guest_count || 0)
                  let displayStatus = work.status
            if (work.status !== 'completed' && work.status !== 'cancelled') {
              displayStatus = isFilled ? 'Staffed' : 'Needs Staff'
            }

            const isSelected = selectedIds.has(work.id)
            const isPaid = work.status === 'completed' && work.client_payment_status === 'paid'
            
            let containerClass = 'block border rounded-2xl p-4 shadow-sm transition-all select-none '
            if (isSelected) {
              containerClass += 'border-slate-900 ring-1 ring-slate-900 bg-white'
            } else if (isPaid) {
              containerClass += 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
            } else {
              containerClass += 'bg-white border-slate-200 hover:border-slate-300'
            }

            return (
              <Link 
                key={work.id} 
                href={selectionMode ? '#' : `/works/${work.id}`} 
                onTouchStart={() => handlePressStart(work.id)}
                onTouchEnd={cancelPress}
                onTouchMove={cancelPress}
                onMouseDown={() => handlePressStart(work.id)}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onContextMenu={(e) => {
                  if (selectionMode || pressTimer.current) e.preventDefault()
                }}
                onClick={(e) => {
                  if (wasLongPress.current) {
                    e.preventDefault()
                    return
                  }
                  if (selectionMode) {
                    e.preventDefault()
                    toggleSelect(e, work.id)
                  }
                }}
                className={containerClass}
              >
                <div className="flex items-start">
                  {selectionMode && (
                    <div className="mr-3 mt-1 shrink-0" onClick={(e) => toggleSelect(e, work.id)}>
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-slate-900" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 text-lg truncate pr-2">{work.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shrink-0
                        ${displayStatus === 'Needs Staff' ? 'bg-amber-100 text-amber-700' : ''}
                        ${displayStatus === 'Staffed' ? 'bg-blue-100 text-blue-700' : ''}
                        ${displayStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${displayStatus === 'cancelled' ? 'bg-slate-100 text-slate-700' : ''}
                      `}>
                        {displayStatus}
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
                  </div>
                </div>
              </Link>
            )
            })}
            </div>
            ))
          })()
        )}
      </div>

      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <span className="font-semibold">{selectedIds.size} selected</span>
            <button 
              onClick={() => setShowConfirm(true)}
              className="flex items-center bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-600 active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Delete {selectedIds.size} Works?</h3>
            <p className="text-center text-slate-500 text-sm mb-6 leading-relaxed">
              This action cannot be undone. All assigned workers for these events will also be removed.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
