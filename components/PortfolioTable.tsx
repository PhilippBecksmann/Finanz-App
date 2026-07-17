import { deleteAsset } from '@/lib/actions/assets'
import {
  assetGainLoss,
  assetGainLossPct,
  assetValue,
  formatEUR,
  formatPct,
} from '@/lib/calc'

type AssetRow = {
  id: string
  symbol: string
  shares: number
  buyPrice: number
}

export function PortfolioTable({
  assets,
  prices,
}: {
  assets: AssetRow[]
  prices: Record<string, number | null>
}) {
  if (assets.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted">
        Noch keine Assets. Füge oben dein erstes Wertpapier hinzu.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="px-4 py-3 font-medium">Symbol</th>
            <th className="px-4 py-3 text-right font-medium">Anzahl</th>
            <th className="px-4 py-3 text-right font-medium">Kaufpreis</th>
            <th className="px-4 py-3 text-right font-medium">Kurs</th>
            <th className="px-4 py-3 text-right font-medium">Wert</th>
            <th className="px-4 py-3 text-right font-medium">G/V</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => {
            const price = prices[a.symbol.toUpperCase()] ?? null
            const gl = assetGainLoss(a, price)
            const glPct = assetGainLossPct(a, price)
            const positive = gl >= 0
            return (
              <tr key={a.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium">{a.symbol}</td>
                <td className="px-4 py-3 text-right tabular-nums">{a.shares}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">
                  {formatEUR(a.buyPrice)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {price == null ? (
                    <span className="text-muted">n/v</span>
                  ) : (
                    formatEUR(price)
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {price == null ? '—' : formatEUR(assetValue(a, price))}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums ${
                    price == null
                      ? 'text-muted'
                      : positive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {price == null ? (
                    '—'
                  ) : (
                    <>
                      {positive ? '+' : '−'}
                      {formatEUR(Math.abs(gl))}
                      <span className="ml-1 text-xs opacity-80">
                        ({formatPct(glPct)})
                      </span>
                    </>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteAsset}>
                    <input type="hidden" name="id" value={a.id} />
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
