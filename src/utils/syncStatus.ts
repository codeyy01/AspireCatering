import { createClient } from '@/utils/supabase/server'

export async function syncWorkStatuses() {
  const supabase = createClient()
  const todayStr = new Date().toISOString().split('T')[0]

  // Update past works to completed
  await supabase
    .from('works')
    .update({ status: 'completed' })
    .lt('event_date', todayStr)
    .neq('status', 'cancelled')
    .neq('status', 'completed')

  // Update today's works to ongoing (unless already cancelled or completed)
  await supabase
    .from('works')
    .update({ status: 'ongoing' })
    .eq('event_date', todayStr)
    .neq('status', 'cancelled')
    .neq('status', 'completed')
    .neq('status', 'ongoing')

  // Update future works to upcoming (unless already cancelled, completed, or ongoing)
  await supabase
    .from('works')
    .update({ status: 'upcoming' })
    .gt('event_date', todayStr)
    .neq('status', 'cancelled')
    .neq('status', 'completed')
    .neq('status', 'ongoing')
    .neq('status', 'upcoming')
}

