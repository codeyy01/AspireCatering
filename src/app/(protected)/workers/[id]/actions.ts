'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAsPaid(assignmentIds: string | string[], workerId: string) {
  const supabase = createClient()
  const ids = Array.isArray(assignmentIds) ? assignmentIds : [assignmentIds]
  
  const { data: assignments } = await supabase
    .from('work_assignments')
    .select('id, agreed_amount')
    .in('id', ids)

  if (!assignments) return

  const now = new Date().toISOString()
  
  await Promise.all(assignments.map(a => 
    supabase
      .from('work_assignments')
      .update({ 
        amount_paid: a.agreed_amount,
        paid_status: 'paid',
        paid_date: now
      })
      .eq('id', a.id)
  ))

  revalidatePath(`/workers/${workerId}`)
}
