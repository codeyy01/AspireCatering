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

export async function removeWorker(assignmentId: string, workId: string) {
  const supabase = createClient()
  
  await supabase
    .from('work_assignments')
    .delete()
    .eq('id', assignmentId)

  revalidatePath(`/works/${workId}`)
}

export async function updateAssignmentAmount(assignmentId: string, amount: number) {
  const supabase = createClient()
  
  await supabase
    .from('work_assignments')
    .update({ agreed_amount: amount })
    .eq('id', assignmentId)

  // It is generally not strictly required to revalidate if the client component maintains its own state,
  // but it's good practice so full refreshes are consistent.
  revalidatePath('/works/[id]', 'page')
}
