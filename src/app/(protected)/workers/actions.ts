'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteWorkers(workerIds: string[]) {
  const supabase = createClient()
  
  if (!workerIds || workerIds.length === 0) return

  await supabase
    .from('workers')
    .delete()
    .in('id', workerIds)

  revalidatePath('/workers')
}
