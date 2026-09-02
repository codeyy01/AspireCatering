'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteWorks } from '../actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DeleteWorkButton({ workId }: { workId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteWorks([workId])
    toast.success('Event deleted successfully')
    router.push('/works')
  }

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="p-2 bg-white rounded-full shadow-sm border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Delete Event"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Delete this Event?</h3>
            <p className="text-center text-slate-500 text-sm mb-6 leading-relaxed">
              This action cannot be undone. All worker assignments for this event will also be removed.
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