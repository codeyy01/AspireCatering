'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IndianRupee, Trash2, Loader2, CheckSquare, Square } from 'lucide-react'
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

  if (!workers || workers.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
        No workers found.
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-2">
        <button 
          onClick={toggleSelectionMode} 
          className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
        >
          {selectionMode ? 'Cancel Selection' : 'Select Multiple'}
        </button>
      </div>

      <div className="space-y-3">
        {workers.map(worker => {
          const isSelected = selectedIds.has(worker.id)
          return (
            <Link 
              key={worker.id} 
              href={selectionMode ? '#' : `/workers/${worker.id}`} 
              onClick={(e) => selectionMode && toggleSelect(e, worker.id)}
              className={`block bg-white border rounded-2xl p-4 shadow-sm transition-colors ${
                isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectionMode && (
                    <div className="mr-1 text-slate-400">
                      {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{worker.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{worker.role || 'Worker'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 flex items-center justify-end">
                    <IndianRupee className="w-3 h-3 mr-0.5" />
                    {Number(worker.default_rate || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Rate</div>
                </div>
              </div>
            </Link>
          )
        })}
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
