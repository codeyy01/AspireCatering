import { BottomNav } from '@/components/BottomNav'
import { createClient } from '@/utils/supabase/server'
import { LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  await supabase.auth.getUser()

  async function signOut() {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="font-bold text-lg text-slate-900 tracking-tight">Catering Tracker</div>
        <form action={signOut}>
          <button type="submit" className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-full">
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </header>
      
      <main className="flex-1 max-w-md mx-auto w-full p-4">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
