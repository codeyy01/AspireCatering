'use client'

import { useState } from 'react'
import { updateAssignmentAmount } from './actions'

export default function EditableAssignmentAmount({ 
  assignmentId, 
  initialAmount 
}: { 
  assignmentId: string | string[], 
  initialAmount: number 
}) {
  const [amount, setAmount] = useState(initialAmount.toString())
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleBlur = async () => {
    setIsEditing(false)
    const newAmount = parseFloat(amount)
    if (isNaN(newAmount) || newAmount === initialAmount) {
      setAmount(initialAmount.toString())
      return
    }

    setIsLoading(true)
    await updateAssignmentAmount(assignmentId, newAmount)
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
    if (e.key === 'Escape') {
      setAmount(initialAmount.toString())
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center space-x-1">
        <span className="text-slate-500 font-bold text-sm">₹</span>
        <input
          autoFocus
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-16 px-1 py-0.5 text-right font-bold text-slate-900 text-sm bg-white border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    )
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={`font-bold text-sm cursor-pointer hover:text-blue-600 transition-colors px-1 -mx-1 rounded hover:bg-blue-50 ${isLoading ? 'opacity-50' : 'text-slate-900'}`}
      title="Click to edit amount"
    >
      ₹{Number(amount).toLocaleString()}
    </div>
  )
}
