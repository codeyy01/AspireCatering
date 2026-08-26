'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAsPaid(assignmentId: string, workerId: string, amount: number) {
  const supabase = createClient()
  
  const { data: assignment } = await supabase
    .from('work_assignments')
    .select('agreed_amount, amount_paid')
    .eq('id', assignmentId)
    .single()

  if (!assignment) return

  const newPaidAmount = Number(assignment.amount_paid) + amount
  const agreedAmount = Number(assignment.agreed_amount)
  
  let newStatus = 'partial'
  if (newPaidAmount >= agreedAmount) {
    newStatus = 'paid'
  }

  await supabase
    .from('work_assignments')
    .update({ 
      amount_paid: newPaidAmount,
      paid_status: newStatus,
      paid_date: newStatus === 'paid' ? new Date().toISOString() : null
    })
    .eq('id', assignmentId)

  revalidatePath(`/workers/${workerId}`)
}
