'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignWorkers(workId: string, formData: FormData) {
  const supabase = createClient()
  
  const rawNames = formData.get('worker_names') as string
  const agreedAmountRaw = formData.get('agreed_amount') as string
  const defaultAgreedAmount = agreedAmountRaw && !isNaN(parseFloat(agreedAmountRaw)) ? parseFloat(agreedAmountRaw) : 0

  if (!rawNames) {
    return { success: false, error: 'No names provided' }
  }

  // Parse names (split by comma or newline, trim, remove empty)
  const rawNamesList = rawNames
    .split(/[\n,]+/)
    .map(n => n.trim())
    .filter(n => n.length > 0)

  // Deduplicate names (case-insensitive) keeping the first typed case
  const uniqueNamesMap = new Map<string, string>()
  for (const n of rawNamesList) {
    if (!uniqueNamesMap.has(n.toLowerCase())) {
      uniqueNamesMap.set(n.toLowerCase(), n)
    }
  }
  const names = Array.from(uniqueNamesMap.values())

  if (names.length === 0) {
    return { success: false, error: 'No valid names provided' }
  }

  // Find existing workers (fetch all to do case-insensitive match in JS safely)
  const { data: allWorkers } = await supabase
    .from('workers')
    .select('id, name, default_rate')

  const existingMap = new Map((allWorkers || []).map(w => [w.name.toLowerCase(), w]))

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
  return { success: true }
}
