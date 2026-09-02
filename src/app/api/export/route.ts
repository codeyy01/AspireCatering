import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()
  
  const { data: works } = await supabase.from("works").select("*").order("event_date", { ascending: false })
  const { data: workers } = await supabase.from("workers").select("*").order("name", { ascending: true })
  
  // Fetch assignments to calculate worker earnings and work assignments
  const { data: assignments } = await supabase
    .from("work_assignments")
    .select("*, workers(name)")

  const workerStats: Record<string, { earned: number, pending: number }> = {}
  if (workers) {
    workers.forEach(w => {
      workerStats[w.id] = { earned: 0, pending: 0 }
    })
  }

  const workAssignmentsMap: Record<string, string[]> = {}
  
  if (assignments) {
    assignments.forEach(a => {
      // Worker stats
      if (workerStats[a.worker_id]) {
        workerStats[a.worker_id].earned += Number(a.agreed_amount || 0)
        workerStats[a.worker_id].pending += (Number(a.agreed_amount || 0) - Number(a.amount_paid || 0))
      }
      // Work assignments
      if (!workAssignmentsMap[a.work_id]) {
        workAssignmentsMap[a.work_id] = []
      }
      if (a.workers?.name) {
        workAssignmentsMap[a.work_id].push(`${a.workers.name} (₹${a.agreed_amount})`)
      }
    })
  }

  const csvRows = []

  csvRows.push("--- WORKS ---")
  csvRows.push("Title,Client Name,Client Phone,Venue,Date,Guests,Amount,Status,Notes,Assigned Workers")
  
  if (works) {
    for (const w of works) {
      const cleanNotes = (w.notes || "").replace(/"/g, "\"\"").replace(/\n/g, " ")
      const assignedText = (workAssignmentsMap[w.id] || []).join(", ")
      csvRows.push(`"${w.title || ""}", "${w.client_name || ""}", "${w.client_phone || ""}", "${w.venue || ""}", "${w.event_date || ""}", "${w.guest_count || 0}", "${w.total_amount || 0}", "${w.status || ""}", "${cleanNotes}", "${assignedText}"`)
    }
  }

  csvRows.push("")
  csvRows.push("")

  csvRows.push("--- WORKERS ---")
  csvRows.push("Name,Role,Default Rate,Total Earnings,Pending Dues")
  
  if (workers) {
    for (const w of workers) {
      const stats = workerStats[w.id] || { earned: 0, pending: 0 }
      csvRows.push(`"${w.name || ""}", "${w.role || ""}", "${w.default_rate || 0}", "${stats.earned}", "${stats.pending}"`)
    }
  }

  return new NextResponse(csvRows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=\"catering_backup.csv\"",
    },
  })
}
