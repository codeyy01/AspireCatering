'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Loader2, CheckSquare, Square } from 'lucide-react'
import { deleteWorkers } from './actions'

type Worker = {
  id: string
  name: string
  role: string
  default_rate: number
}

export default function WorkersList({ workers }: { workers: Worker[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteWorkers(Array.from(selectedIds))
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

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search workers..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
          />
        </div>
        <div className="flex justify-end">
          <button 
            onClick={toggleSelectionMode} 
            className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            {selectionMode ? 'Cancel Selection' : 'Select Multiple'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-24">
        {filteredWorkers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No workers found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredWorkers.map(worker => {
              const isSelected = selectedIds.has(worker.id)
              // Assign a slight color tint based on the first letter of their name for a bit of flair
              const colors = ['text-blue-600', 'text-emerald-600', 'text-rose-600', 'text-amber-600', 'text-indigo-600', 'text-violet-600']
              const colorIndex = worker.name.charCodeAt(0) % colors.length
              const roleColor = colors[colorIndex]

              return (
                <Link 
                  key={worker.id} 
                  href={selectionMode ? '#' : `/workers/${worker.id}`} 
                  onClick={(e) => selectionMode && toggleSelect(e, worker.id)}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {selectionMode && (
                      <div className="shrink-0 text-slate-400">
                        {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-bold text-slate-900 truncate text-base">{worker.name}</h3>
                      {worker.role && (
                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 truncate ${roleColor}`}>
                          {worker.role}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {!selectionMode && (
                    <svg className="w-4 h-4 text-slate-300 shrink-0 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-[80px] left-4 right-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom-4">
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
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Delete {selectedIds.size} Workers?</h3>
            <p className="text-center text-slate-500 text-sm mb-6 leading-relaxed">
              This action cannot be undone. They will also be removed from any works they are currently assigned to.
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
