import { prisma } from '@/lib/prisma'
import { getQuotes } from '@/lib/quotes'
import { AssetForm } from '@/components/AssetForm'
import { PortfolioTable } from '@/components/PortfolioTable'
import { formatEUR, formatPct, portfolioValue } from '@/lib/calc'

// Prices are fetched live, so never serve a statically cached version.
export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  const assets = await prisma.asset.findMany({ orderBy: { createdAt: 'asc' } })
  const prices = await getQuotes(assets.map((a) => a.symbol))

  const totalValue = portfolioValue(assets, prices)
  const totalCost = assets.reduce((s, a) => s + a.shares * a.buyPrice, 0)
  const totalGain = totalValue - totalCost
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : null
  const positive = totalGain >= 0

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Portfolio</h1>
        <p className="mt-1 text-sm text-muted">
          Kurse werden beim Laden live über Yahoo Finance aktualisiert (EOD). Alle Werte in EUR.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Neues Asset
        </h2>
        <AssetForm />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-end gap-4 text-sm">
          <span className="text-muted">
            Investiert: <span className="text-foreground">{formatEUR(totalCost)}</span>
          </span>
          <span className="text-muted">
            Wert: <span className="font-semibold text-foreground">{formatEUR(totalValue)}</span>
          </span>
          <span
            className={
              positive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }
          >
            {positive ? '+' : '−'}
            {formatEUR(Math.abs(totalGain))} ({formatPct(totalGainPct)})
          </span>
        </div>
        <PortfolioTable assets={assets} prices={prices} />
      </section>
    </div>
  )
}
