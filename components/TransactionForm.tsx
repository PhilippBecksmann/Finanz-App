'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addTransaction, type ActionResult } from '@/lib/actions/transactions'

const CATEGORIES = [
  'Gehalt',
  'Miete',
  'Essen',
  'Abo',
  'Transport',
  'Freizeit',
  'Sonstiges',
]

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40'

export function TransactionForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    addTransaction,
    null,
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Betrag (€)</span>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="0,00"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Typ</span>
        <select name="type" defaultValue="EXPENSE" className={inputClass}>
          <option value="EXPENSE">Ausgabe</option>
          <option value="INCOME">Einnahme</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Kategorie</span>
        <select name="category" defaultValue="Essen" className={inputClass}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Datum</span>
        <input name="date" type="date" defaultValue={today} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted">Notiz (optional)</span>
        <input name="note" type="text" placeholder="z. B. Wocheneinkauf" className={inputClass} />
      </label>

      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input name="isRecurring" type="checkbox" className="h-4 w-4" />
        <span>Wiederkehrend (z. B. Abo, Miete)</span>
      </label>

      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Speichern…' : 'Transaktion hinzufügen'}
        </button>
        {state && !state.ok && (
          <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>
        )}
      </div>
    </form>
  )
}
