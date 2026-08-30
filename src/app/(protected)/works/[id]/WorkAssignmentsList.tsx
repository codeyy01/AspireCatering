'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckSquare, Square } from 'lucide-react'
import { removeWorker } from './actions'
import EditableAssignmentAmount from './EditableAssignmentAmount'
import TogglePaidStatus from './TogglePaidStatus'

export default function WorkAssignmentsList({ 
  groupedAssignments, 
  workId 
}: { 
  groupedAssignments: {
    id: string
    worker_id: string
    headcount: number
    total_agreed_amount: number
    paid_status: string
    assignment_ids: string[]
    workers: {
      name: string
      role: string
    }
  }[]
  workId: string
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
    
    // gather all assignment_ids from the selected groups
    let allIdsToRemove: string[] = []
    groupedAssignments.forEach(a => {
      if (selectedIds.has(a.id)) {
        allIdsToRemove = allIdsToRemove.concat(a.assignment_ids)
      }
    })
    
    await removeWorker(allIdsToRemove, workId)
    setSelectedIds(new Set())
    setSelectionMode(false)
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

  if (!groupedAssignments || groupedAssignments.length === 0) {
    return (
      <div className="bg-slate-100 rounded-2xl p-6 text-center text-slate-500 text-sm border border-slate-200 border-dashed">
        No workers assigned yet.
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div />
        <button 
          onClick={toggleSelectionMode}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1 bg-slate-100 rounded-lg transition-colors"
        >
          {selectionMode ? 'Cancel' : 'Select'}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-20">
        <div className="divide-y divide-slate-100">
          {groupedAssignments.map(assignment => {
            const isSelected = selectedIds.has(assignment.id)
            return (
              <div key={assignment.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                
                <div className="flex items-center flex-1 min-w-0 pr-3">
                  {selectionMode && (
                    <div className="mr-3 shrink-0" onClick={(e) => toggleSelect(e, assignment.id)}>
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-slate-900" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                  )}
                  <Link href={selectionMode ? '#' : `/workers/${assignment.worker_id}`} onClick={(e) => { if(selectionMode) toggleSelect(e, assignment.id) }} className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">
                      {assignment.workers?.name || 'Unknown Worker'}
                      {assignment.headcount > 1 && (
                        <span className="ml-1.5 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs">({assignment.headcount})</span>
                      )}
                    </div>
                    {assignment.workers?.role && !['worker', 'other'].includes(assignment.workers.role.toLowerCase()) && (
                      <div className="text-[10px] text-slate-500 capitalize truncate mt-0.5">{assignment.workers.role}</div>
                    )}
                  </Link>
                </div>
                
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right flex flex-col items-end">
                    <EditableAssignmentAmount 
                      assignmentId={assignment.assignment_ids} 
                      initialAmount={assignment.total_agreed_amount} 
                    />
                    <TogglePaidStatus 
                      assignmentId={assignment.assignment_ids} 
                      initialStatus={assignment.paid_status || 'unpaid'} 
                    />
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      </div>
      
      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <span className="font-semibold">{selectedIds.size} selected</span>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
