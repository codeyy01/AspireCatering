'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function assignWorkers(workId: string, formData: FormData) {
  const supabase = createClient()
  
  const rawNames = formData.get('worker_names') as string
  const agreedAmountRaw = formData.get('agreed_amount') as string
  const defaultAgreedAmount = agreedAmountRaw && !isNaN(parseFloat(agreedAmountRaw)) ? parseFloat(agreedAmountRaw) : 0

  if (!rawNames) {
    redirect(`/works/${workId}`)
  }

  // Parse names (split by comma or newline, trim, remove empty)
  const names = rawNames
    .split(/[\n,]+/)
    .map(n => n.trim())
    .filter(n => n.length > 0)

  if (names.length === 0) {
    redirect(`/works/${workId}`)
  }

  // Find existing workers
  const { data: existingWorkers } = await supabase
    .from('workers')
    .select('id, name, default_rate')
    .in('name', names)

  const existingMap = new Map((existingWorkers || []).map(w => [w.name.toLowerCase(), w]))

  const newWorkersToInsert = []
  const assignmentsToInsert = []

  // Process names
  for (const name of names) {
    const existing = existingMap.get(name.toLowerCase())
    if (existing) {
      // Use existing worker
      assignmentsToInsert.push({
        work_id: workId,
        worker_id: existing.id,
        agreed_amount: defaultAgreedAmount || existing.default_rate || 0,
        paid_status: 'unpaid'
      })
    } else {
      newWorkersToInsert.push({
        name: name,
        role: 'worker',
        default_rate: defaultAgreedAmount
      })
    }
  }

  // Create new workers if any
  if (newWorkersToInsert.length > 0) {
    const { data: insertedWorkers } = await supabase
      .from('workers')
      .insert(newWorkersToInsert)
      .select('id')
      
    if (insertedWorkers) {
      for (const nw of insertedWorkers) {
        assignmentsToInsert.push({
          work_id: workId,
          worker_id: nw.id,
          agreed_amount: defaultAgreedAmount,
          paid_status: 'unpaid'
        })
      }
    }
  }

  // Create assignments
  if (assignmentsToInsert.length > 0) {
    // Upsert or insert (ignore conflicts if already assigned)
    await supabase.from('work_assignments').insert(assignmentsToInsert)
  }

  revalidatePath(`/works/${workId}`)
  revalidatePath('/workers')
  redirect(`/works/${workId}`)
}
