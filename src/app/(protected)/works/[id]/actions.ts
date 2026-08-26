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
