import { deleteTransaction } from '@/lib/actions/transactions'
import { formatEUR } from '@/lib/calc'

type TxRow = {
  id: string
  amount: number
  type: string
  category: string
  date: Date
  isRecurring: boolean
  note: string | null
}

const dateFmt = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function TransactionList({ transactions }: { transactions: TxRow[] }) {
  if (transactions.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted">
        Keine Transaktionen für diesen Zeitraum.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="px-4 py-3 font-medium">Datum</th>
            <th className="px-4 py-3 font-medium">Kategorie</th>
            <th className="px-4 py-3 font-medium">Notiz</th>
            <th className="px-4 py-3 text-right font-medium">Betrag</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const income = t.type === 'INCOME'
            return (
              <tr key={t.id} className="border-b border-border/60 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {dateFmt.format(t.date)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{t.category}</span>
                  {t.isRecurring && (
                    <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs text-muted">
                      ↻ wiederkehrend
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{t.note ?? '—'}</td>
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums ${
                    income ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {income ? '+' : '−'}
                  {formatEUR(t.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteTransaction}>
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      type="submit"
                      aria-label="Löschen"
                      className="rounded px-2 py-1 text-muted hover:text-red-600"
                    >
                      ✕
                    </button>
                  </form>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
