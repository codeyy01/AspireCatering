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

  // Parse names and detect headcount
  const parsedInputs: { name: string, count: number }[] = []
  const rawNamesList = rawNames
    .split(/[\n,]+/)
    .map(n => n.trim())
    .filter(n => n.length > 0)

  for (const raw of rawNamesList) {
    // Match "Name 4"
    const match = raw.match(/^(.*?)\s+(\d+)$/)
    if (match) {
      parsedInputs.push({ name: match[1].trim(), count: parseInt(match[2], 10) })
    } else {
      parsedInputs.push({ name: raw, count: 1 })
    }
  }

  // Deduplicate names but sum up the counts
  const uniqueNamesMap = new Map<string, { name: string, count: number }>()
  for (const p of parsedInputs) {
    const key = p.name.toLowerCase()
    if (uniqueNamesMap.has(key)) {
       uniqueNamesMap.get(key)!.count += p.count
    } else {
       uniqueNamesMap.set(key, { name: p.name, count: p.count })
    }
  }
  const items = Array.from(uniqueNamesMap.values())

  if (items.length === 0) {
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
  for (const item of items) {
    const existing = existingMap.get(item.name.toLowerCase())
    if (existing) {
      // Use existing worker
      for (let i = 0; i < item.count; i++) {
        assignmentsToInsert.push({
          work_id: workId,
          worker_id: existing.id,
          agreed_amount: defaultAgreedAmount || existing.default_rate || 0,
          paid_status: 'unpaid'
        })
      }
    } else {
      // Since it's a new worker, we need to insert it once, but then add multiple assignments
      // We'll store the count with the new worker temp object
      newWorkersToInsert.push({
        name: item.name,
        role: 'worker',
        default_rate: defaultAgreedAmount,
        _count: item.count // temporary field to pass the count
      })
    }
  }

  // Create new workers if any
  if (newWorkersToInsert.length > 0) {
    // Strip out _count before inserting into DB
    const dbWorkersToInsert = newWorkersToInsert.map(w => ({
      name: w.name,
      role: w.role,
      default_rate: w.default_rate
    }))

    const { data: insertedWorkers } = await supabase
      .from('workers')
      .insert(dbWorkersToInsert)
      .select('id, name')
      
    if (insertedWorkers) {
      for (const nw of insertedWorkers) {
        // Find the original item to get the count
        const originalItem = newWorkersToInsert.find(w => w.name === nw.name)
        const count = originalItem ? originalItem._count : 1

        for (let i = 0; i < count; i++) {
          assignmentsToInsert.push({
            work_id: workId,
            worker_id: nw.id,
            agreed_amount: defaultAgreedAmount,
            paid_status: 'unpaid'
          })
        }
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
