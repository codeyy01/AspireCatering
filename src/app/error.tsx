'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
          <p className="text-sm text-slate-500">We had trouble loading this data. Please check your connection and try again.</p>
        </div>
        <button
          onClick={() => reset()}
          className="w-full py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  )
}