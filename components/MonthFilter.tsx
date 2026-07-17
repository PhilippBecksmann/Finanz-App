'use client'

import { useRouter } from 'next/navigation'

export function MonthFilter({ month }: { month: string }) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="text-muted" htmlFor="month">
        Monat
      </label>
      <input
        id="month"
        type="month"
        value={month}
        onChange={(e) => {
          const value = e.target.value
          router.push(value ? `/transactions?month=${value}` : '/transactions')
        }}
        className="rounded-md border border-border bg-background px-2 py-1 outline-none"
      />
      {month && (
        <button
          onClick={() => router.push('/transactions')}
          className="rounded-md border border-border px-2 py-1 text-muted hover:text-foreground"
        >
          Alle anzeigen
        </button>
      )}
    </div>
  )
}
