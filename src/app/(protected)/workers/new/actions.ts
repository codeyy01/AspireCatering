'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createWorker(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string
  const default_rate = formData.get('default_rate') ? parseFloat(formData.get('default_rate') as string) : 0

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
    throw new Error('Failed to create worker')
  }

  revalidatePath('/workers')
  redirect('/workers')
}
