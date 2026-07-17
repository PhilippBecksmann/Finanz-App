// Pure calculation & formatting helpers, shared by the portfolio page and dashboard.
// No DB or network access here — keep these easily testable.

import type { HistoryPoint } from '@/lib/quotes'

export type TxType = 'INCOME' | 'EXPENSE'

export type TransactionLike = {
  amount: number
  type: string // 'INCOME' | 'EXPENSE'
}

export type AssetLike = {
  symbol: string
  shares: number
  buyPrice: number
}

/** Net cashflow: sum of income minus sum of expenses. */
export function cashflowBalance(transactions: TransactionLike[]): number {
  return transactions.reduce(
    (sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount),
    0,
  )
}

/** Current market value of a single holding (0 if price unknown). */
export function assetValue(asset: AssetLike, price: number | null): number {
  return price == null ? 0 : asset.shares * price
}

/** Amount originally invested into a holding. */
export function assetCost(asset: AssetLike): number {
  return asset.shares * asset.buyPrice
}

/** Absolute gain/loss for a single holding. */
export function assetGainLoss(asset: AssetLike, price: number | null): number {
  if (price == null) return 0
  return assetValue(asset, price) - assetCost(asset)
}

/** Percentage gain/loss for a single holding (null if not computable). */
export function assetGainLossPct(
  asset: AssetLike,
  price: number | null,
): number | null {
  const cost = assetCost(asset)
  if (price == null || cost === 0) return null
  return (assetGainLoss(asset, price) / cost) * 100
}

/** Total current value of the whole portfolio. */
export function portfolioValue(
  assets: AssetLike[],
  prices: Record<string, number | null>,
): number {
  return assets.reduce(
    (sum, a) => sum + assetValue(a, prices[a.symbol.toUpperCase()] ?? null),
    0,
  )
}

/** Sum of expenses grouped by category, sorted descending. For the pie chart. */
export function spendingByCategory(
  transactions: (TransactionLike & { category: string })[],
): { category: string; total: number }[] {
  const map = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== 'EXPENSE') continue
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
  }
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Reconstruct total portfolio value over time from each holding's price history.
 * Assumes current share counts held constant across the window (documented
 * simplification). Aligns series by date and sums shares * close per day.
 */
export function portfolioHistory(
  holdings: { asset: AssetLike; history: HistoryPoint[] }[],
): { date: string; value: number }[] {
  const byDate = new Map<string, number>()
  for (const { asset, history } of holdings) {
    for (const point of history) {
      byDate.set(point.date, (byDate.get(point.date) ?? 0) + asset.shares * point.close)
    }
  }
  return [...byDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Format a number as EUR currency (de-DE). */
export function formatEUR(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

/** Format a number as a signed percentage, e.g. "+12.3 %". */
export function formatPct(value: number | null): string {
  if (value == null) return '–'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)} %`
}
