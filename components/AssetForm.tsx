'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addAsset, type ActionResult } from '@/lib/actions/assets'

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40'

export function AssetForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    addAsset,
    null,
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Ticker-Symbol</span>
        <input
          name="symbol"
          type="text"
          required
          placeholder="z. B. AAPL"
          className={`${inputClass} uppercase`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Anzahl Aktien</span>
        <input
          name="shares"
          type="number"
          step="any"
          min="0"
          required
          placeholder="0"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Kaufpreis (€)</span>
        <input
          name="buyPrice"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="0,00"
          className={inputClass}
        />
      </label>

      <div className="flex items-center gap-3 sm:col-span-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Speichern…' : 'Asset hinzufügen'}
        </button>
        {state && !state.ok && (
          <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>
        )}
      </div>
    </form>
  )
}
