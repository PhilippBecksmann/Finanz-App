import { prisma } from '@/lib/prisma'
import { TransactionForm } from '@/components/TransactionForm'
import { TransactionList } from '@/components/TransactionList'
import { MonthFilter } from '@/components/MonthFilter'
import { formatEUR } from '@/lib/calc'

// Build a [start, end) date range for a given "YYYY-MM" string.
function monthRange(month: string): { start: Date; end: Date } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) return null
  const year = Number(match[1])
  const m = Number(match[2]) - 1
  return { start: new Date(year, m, 1), end: new Date(year, m + 1, 1) }
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month = '' } = await searchParams
  const range = monthRange(month)

  const transactions = await prisma.transaction.findMany({
    where: range ? { date: { gte: range.start, lt: range.end } } : undefined,
    orderBy: { date: 'desc' },
  })

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0)
  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Cashflow</h1>
        <p className="mt-1 text-sm text-muted">
          Einnahmen und Ausgaben erfassen und nach Monat filtern.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Neue Transaktion
        </h2>
        <TransactionForm />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MonthFilter month={range ? month : ''} />
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400">
              + {formatEUR(income)}
            </span>
            <span className="text-red-600 dark:text-red-400">
              − {formatEUR(expense)}
            </span>
            <span className="font-semibold">= {formatEUR(income - expense)}</span>
          </div>
        </div>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  )
}
