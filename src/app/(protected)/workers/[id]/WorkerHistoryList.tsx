'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { CheckSquare, Square, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { markAsPaid } from '../../works/[id]/actions'
import { toast } from 'sonner'
import TogglePaidStatus from '../../works/[id]/TogglePaidStatus'
import EditableAssignmentAmount from '../../works/[id]/EditableAssignmentAmount'

type GroupedAssignment = {
  workId: string
  workTitle: string
  workDate: string
  assignmentIds: string[]
  agreedAmount: number
  amountPaid: number
  headcount: number
  paidStatus: string
}

export default function WorkerHistoryList({ assignments }: { assignments: GroupedAssignment[] }) {
  const [selectedWorkIds, setSelectedWorkIds] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const pressTimer = useRef<NodeJS.Timeout | null>(null)
  const wasLongPress = useRef(false)

  const handlePressStart = (id: string) => {
    wasLongPress.current = false
    pressTimer.current = setTimeout(() => {
      wasLongPress.current = true
      setSelectionMode(true)
      setSelectedWorkIds(prev => new Set(prev).add(id))
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50)
      }
    }, 400)
  }

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  const toggleSelect = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation()
    const newSet = new Set(selectedWorkIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedWorkIds(newSet)
  }

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedWorkIds(new Set())
      setSelectionMode(false)
    } else {
      setSelectionMode(true)
    }
  }

  const handleMarkPaid = async () => {
    setIsUpdating(true)
    
    // Flatten assignmentIds for all selected works
    const idsToUpdate: string[] = []
    assignments.forEach(a => {
      if (selectedWorkIds.has(a.workId)) {
        idsToUpdate.push(...a.assignmentIds)
      }
    })
    
    await markAsPaid(idsToUpdate)
    toast.success(`Marked ${selectedWorkIds.size} works as paid`)
    
    setSelectedWorkIds(new Set())
    setSelectionMode(false)
    setIsUpdating(false)
  }

  return (
    <>
      {assignments.length > 0 && (
        <div className="flex justify-end mb-3">
          <button 
            onClick={toggleSelectionMode} 
            className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            {selectionMode ? 'Cancel Selection' : 'Select Multiple'}
          </button>
        </div>
      )}

      <div className="space-y-3 pb-24">
        {(!assignments || assignments.length === 0) ? (
          <div className="bg-slate-100 rounded-2xl p-6 text-center text-slate-500 text-sm border border-slate-200 border-dashed">
            No works assigned yet.
          </div>
        ) : (
          assignments.map(group => {
            const isSelected = selectedWorkIds.has(group.workId)
            
            return (
              <div 
                key={group.workId} 
                onTouchStart={() => handlePressStart(group.workId)}
                onTouchEnd={cancelPress}
                onTouchMove={cancelPress}
                onMouseDown={() => handlePressStart(group.workId)}
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
                    toggleSelect(e, group.workId)
                  }
                }}
                className={`bg-white border transition-colors rounded-2xl p-4 shadow-sm select-none cursor-pointer ${
                  isSelected ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start">
                    {selectionMode && (
                      <div className="shrink-0 mr-3 mt-1 text-slate-400" onClick={(e) => toggleSelect(e, group.workId)}>
                        {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                      </div>
                    )}
                    <div>
                      <Link 
                        href={`/works/${group.workId}`} 
                        className="font-bold text-slate-900 hover:underline flexitems-center"
                        onClick={(e) => {
                          if (selectionMode) e.preventDefault()
                        }}
                      >
                        {group.workTitle}
                        {group.headcount > 1 && (
                          <span className="ml-2 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                            ({group.headcount} Workers)
                          </span>
                        )}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {group.workDate ? format(new Date(group.workDate), 'MMM d, yyyy') : 'No date'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-right ${selectionMode ? 'pointer-events-none opacity-60' : ''}`}>
                    <div className="mb-1 flex justify-end">
                      <EditableAssignmentAmount 
                        assignmentId={group.assignmentIds} 
                        initialAmount={group.agreedAmount} 
                      />
                    </div>
                    <TogglePaidStatus 
                      assignmentId={group.assignmentIds} 
                      initialStatus={group.paidStatus} 
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      
      {selectionMode && selectedWorkIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-full duration-300 rounded-t-3xl pb-safe">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">{selectedWorkIds.size} works selected</span>
            
            <div className="flex space-x-2">
              <button 
                onClick={handleMarkPaid}
                disabled={isUpdating}
                className="flexitems-center bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Mark as Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
