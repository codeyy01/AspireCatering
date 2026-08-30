'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWorkStatus(workId: string, status: string) {
  const supabase = createClient()
  
  await supabase
    .from('works')
    .update({ status })
    .eq('id', workId)

  revalidatePath(`/works/${workId}`)
  revalidatePath('/works')
}

export async function removeWorker(assignmentId: string | string[], workId: string) {
  const supabase = createClient()
  
  if (Array.isArray(assignmentId)) {
    await supabase.from('work_assignments').delete().in('id', assignmentId)
  } else {
    await supabase.from('work_assignments').delete().eq('id', assignmentId)
  }

  revalidatePath(`/works/${workId}`)
}

export async function updateAssignmentAmount(assignmentId: string | string[], amount: number) {
  const supabase = createClient()
  
  if (Array.isArray(assignmentId)) {
    // If it's a grouped headcount (e.g. 4 people), we store the per-person amount
    // Wait, if amount is TOTAL amount entered by user (e.g. 4000), we need to store (4000 / 4) in each row
    const perPerson = amount / assignmentId.length
    await supabase.from('work_assignments').update({ agreed_amount: perPerson }).in('id', assignmentId)
  } else {
    await supabase.from('work_assignments').update({ agreed_amount: amount }).eq('id', assignmentId)
  }

  revalidatePath('/works/[id]', 'page')
}

export async function togglePaidStatus(assignmentId: string | string[], currentStatus: string) {
  const supabase = createClient()
  
  const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid'
  
  if (Array.isArray(assignmentId)) {
    await supabase.from('work_assignments').update({ paid_status: newStatus }).in('id', assignmentId)
  } else {
    await supabase.from('work_assignments').update({ paid_status: newStatus }).eq('id', assignmentId)
  }

  revalidatePath('/works/[id]', 'page')
  return newStatus
}

export async function toggleClientPaymentStatus(workId: string, currentStatus: string) {
  const supabase = createClient()
  const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid'

  // Attempt to update the custom column.
  // We will tell the user to run ALTER TABLE to add 'client_payment_status'
  const { error } = await supabase
    .from('works')
    .update({ client_payment_status: newStatus })
    .eq('id', workId)

  if (error) {
    console.error('Failed to update client payment status. Has the SQL migration been run?', error)
    // Revert visually if there was a DB error
    return currentStatus
  }

  revalidatePath('/works/[id]', 'page')
  return newStatus
}
