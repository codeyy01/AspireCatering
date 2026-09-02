'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWorkStatus(workId: string, status: string) {
  const supabase = createClient()
  
  await supabase
    .from('works')
    .update({ status })
    .eq('id', workId)

  revalidatePath('/', 'layout')
  revalidatePath('/', 'layout')
}

export async function removeWorker(assignmentId: string | string[]) {
  const supabase = createClient()
  
  if (Array.isArray(assignmentId)) {
    await supabase.from('work_assignments').delete().in('id', assignmentId)
  } else {
    await supabase.from('work_assignments').delete().eq('id', assignmentId)
  }

  revalidatePath('/', 'layout')
}

export async function updateAssignmentAmount(assignmentId: string | string[], amount: number) {
  const supabase = createClient()
  const ids = Array.isArray(assignmentId) ? assignmentId : [assignmentId]
  const perPerson = amount / ids.length

  const { data: assignments } = await supabase
    .from('work_assignments')
    .select('id, amount_paid')
    .in('id', ids)

  if (!assignments) return

  await Promise.all(assignments.map(a => {
    let newStatus = 'unpaid'
    const paid = Number(a.amount_paid || 0)
    if (paid > 0) {
      if (paid >= perPerson) newStatus = 'paid'
      else newStatus = 'partial'
    }

    return supabase
      .from('work_assignments')
      .update({ 
        agreed_amount: perPerson,
        paid_status: newStatus,
        paid_date: newStatus === 'paid' ? new Date().toISOString() : null
      })
      .eq('id', a.id)
  }))

  revalidatePath('/', 'layout')
}

export async function markAsPaid(assignmentIds: string[]) {
  const supabase = createClient()
  
  const { data: assignments } = await supabase
    .from('work_assignments')
    .select('id, agreed_amount')
    .in('id', assignmentIds)

  if (!assignments) return

  await Promise.all(assignments.map(a => 
    supabase
      .from('work_assignments')
      .update({ 
        paid_status: 'paid',
        amount_paid: a.agreed_amount,
        paid_date: new Date().toISOString()
      })
      .eq('id', a.id)
  ))

  revalidatePath('/', 'layout')
}

export async function togglePaidStatus(assignmentId: string | string[], currentStatus: string) {
  const supabase = createClient()
  const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid'
  const ids = Array.isArray(assignmentId) ? assignmentId : [assignmentId]

  const { data: assignments } = await supabase
    .from('work_assignments')
    .select('id, agreed_amount')
    .in('id', ids)

  if (!assignments) return currentStatus

  await Promise.all(assignments.map(a => 
    supabase
      .from('work_assignments')
      .update({ 
        paid_status: newStatus,
        amount_paid: newStatus === 'paid' ? a.agreed_amount : 0,
        paid_date: newStatus === 'paid' ? new Date().toISOString() : null
      })
      .eq('id', a.id)
  ))

  revalidatePath('/', 'layout')
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

  revalidatePath('/', 'layout')
  return newStatus
}
