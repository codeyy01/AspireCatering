'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteWorks } from '../actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DeleteWorkButton({ workId }: { workId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return
    
    setIsDeleting(true)
    await deleteWorks([workId])
    toast.success('Event deleted successfully')
    router.push('/works')
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 bg-white rounded-full shadow-sm border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Delete Event"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  )
}