'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteWorks(workIds: string[]) {
  const supabase = createClient()
  
  // delete will cascade to work_assignments if ON DELETE CASCADE is set.
  // otherwise, we should delete assignments first. Just to be safe, delete from works directly, 
  // we assume cascade is set or we delete manually.
  await supabase
    .from('works')
    .delete()
    .in('id', workIds)

  revalidatePath('/works')
  revalidatePath('/dashboard')
}
