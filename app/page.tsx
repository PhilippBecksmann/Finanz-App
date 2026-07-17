import { prisma } from '@/lib/prisma'
import { getHistory, getQuotes } from '@/lib/quotes'
import { StatCard } from '@/components/StatCard'
import { SpendingPieChart } from '@/components/SpendingPieChart'
import { PortfolioLineChart } from '@/components/PortfolioLineChart'
import {
  cashflowBalance,
  formatEUR,
  portfolioHistory,
  portfolioValue,
  spendingByCategory,
} from '@/lib/calc'

// Live prices → always render fresh.
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [transactions, assets] = await Promise.all([
    prisma.transaction.findMany(),
    prisma.asset.findMany({ orderBy: { createdAt: 'asc' } }),
  ])

  // Portfolio: current prices + reconstructed value history (parallel).
  const [prices, histories] = await Promise.all([
    getQuotes(assets.map((a) => a.symbol)),
    Promise.all(assets.map((a) => getHistory(a.symbol, 180))),
  ])

  const balance = cashflowBalance(transactions)
  const portfolio = portfolioValue(assets, prices)
  const netWorth = balance + portfolio

  const spending = spendingByCategory(transactions)
  const history = portfolioHistory(
    assets.map((a, i) => ({ asset: a, history: histories[i] })),
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Dein Gesamtvermögen aus Cashflow-Saldo und Portfolio auf einen Blick.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Net Worth"
          value={formatEUR(netWorth)}
          hint="Cashflow-Saldo + Portfolio-Wert"
          tone={netWorth >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          label="Cashflow-Saldo"
          value={formatEUR(balance)}
          hint="Einnahmen − Ausgaben"
          tone={balance >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          label="Portfolio-Wert"
          value={formatEUR(portfolio)}
          hint={`${assets.length} Position${assets.length === 1 ? '' : 'en'}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Ausgaben nach Kategorie
          </h2>
          <SpendingPieChart data={spending} />
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Portfolio-Wertentwicklung
          </h2>
          <PortfolioLineChart data={history} />
        </section>
      </div>
    </div>
  )
}
