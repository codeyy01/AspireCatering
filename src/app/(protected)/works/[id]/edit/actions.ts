'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWork(workId: string, formData: FormData) {
  const supabase = createClient()
  
  let title = formData.get('title') as string
  const client_name = formData.get('client_name') as string
  const client_phone = formData.get('client_phone') as string
  const venue = formData.get('venue') as string
  const event_date = formData.get('event_date') as string
  const guest_count = formData.get('guest_count') ? parseInt(formData.get('guest_count') as string) : null
  const total_amount = formData.get('total_amount') ? parseFloat(formData.get('total_amount') as string) : 0
  const referred_by = formData.get('referred_by') as string
  const notes = formData.get('notes') as string
  
  if (!title || title.trim() === '') {
    title = `Work at ${venue || 'Unknown Venue'}`
  }

  const { error } = await supabase
    .from('works')
    .update({
      title,
      client_name,
      client_phone,
      venue,
      event_date,
      guest_count,
      total_amount,
      referred_by,
      notes,
    })
    .eq('id', workId)

  if (error) {
    console.error("Update Error:", error)
    throw new Error('Failed to update work: ' + error.message)
  }

  revalidatePath(`/works/${workId}`)
  revalidatePath('/works')
  return { success: true }
}
