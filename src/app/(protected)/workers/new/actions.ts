'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createWorker(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string
  const rawRate = formData.get('default_rate') as string
  const default_rate = rawRate && !isNaN(Number(rawRate)) ? parseFloat(rawRate) : 0

  const { error } = await supabase
    .from('workers')
    .insert([
      {
        name,
        phone,
        role,
        default_rate,
        active: true
      }
    ])

  if (error) {
    console.error(error)
    return { error: 'Failed to create worker. Please try again.' }
  }

  revalidatePath('/workers')
  return { success: true }
}
