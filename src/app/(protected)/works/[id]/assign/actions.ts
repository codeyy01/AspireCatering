'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function assignWorkers(workId: string, formData: FormData) {
  const supabase = createClient()
  
  // Extract assigned worker IDs and amounts
  const keys = Array.from(formData.keys())
  const workerIds = keys.filter(k => k.startsWith('worker_') && formData.get(k) === 'on').map(k => k.replace('worker_', ''))
  
  const assignments = workerIds.map(workerId => ({
    work_id: workId,
    worker_id: workerId,
    agreed_amount: formData.get(`amount_${workerId}`) ? Number(formData.get(`amount_${workerId}`)) : 0,
    paid_status: 'unpaid'
  }))

  if (assignments.length > 0) {
    await supabase.from('work_assignments').insert(assignments)
  }

  revalidatePath(`/works/${workId}`)
  redirect(`/works/${workId}`)
}
