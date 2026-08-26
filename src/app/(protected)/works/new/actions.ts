'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWork(formData: FormData) {
  const supabase = createClient()
  
  let title = formData.get('title') as string
  const client_name = formData.get('client_name') as string
  const client_phone = formData.get('client_phone') as string
  const venue = formData.get('venue') as string
  const event_date = formData.get('event_date') as string
  const guestCountRaw = formData.get('guest_count') as string
  const guest_count = guestCountRaw && !isNaN(parseInt(guestCountRaw)) ? parseInt(guestCountRaw) : null
  
  const totalAmountRaw = formData.get('total_amount') as string
  const total_amount = totalAmountRaw && !isNaN(parseFloat(totalAmountRaw)) ? parseFloat(totalAmountRaw) : 0
  
  const referred_by = formData.get('referred_by') as string
  const notes = formData.get('notes') as string
  
  if (!title || title.trim() === '') {
    title = `Work at ${venue || 'Unknown Venue'}`
  }

  const { data, error } = await supabase
    .from('works')
    .insert([
      {
        title,
        client_name,
        client_phone,
        venue,
        event_date,
        guest_count,
        total_amount,
        referred_by,
        notes,
        status: 'upcoming'
      }
    ])
    .select()

  if (error || !data || data.length === 0) {
    console.error("Insert Error:", error)
    return { error: 'Failed to create work: ' + (error?.message || 'No data returned') }
  }

  revalidatePath('/works')
  return { success: true, id: data[0].id }
}
