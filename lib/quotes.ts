import YahooFinance from 'yahoo-finance2'

// One shared client for the whole server process.
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

// ---- Simple in-memory TTL cache (EOD data is fine to cache aggressively) ----
type CacheEntry<T> = { value: T; expires: number }
const quoteCache = new Map<string, CacheEntry<number | null>>()
const historyCache = new Map<string, CacheEntry<HistoryPoint[]>>()

const QUOTE_TTL = 15 * 60 * 1000 // 15 minutes
const HISTORY_TTL = 6 * 60 * 60 * 1000 // 6 hours

export type HistoryPoint = { date: string; close: number } // date = YYYY-MM-DD

function normalize(symbol: string): string {
  return symbol.trim().toUpperCase()
}

/**
 * Current (EOD/live) price for a symbol in its native currency.
 * Returns null for invalid tickers or on any network/parse error, so the UI
 * can show "n/v" instead of crashing.
 */
export async function getQuote(symbol: string): Promise<number | null> {
  const sym = normalize(symbol)
  const cached = quoteCache.get(sym)
  if (cached && cached.expires > Date.now()) return cached.value

  let price: number | null = null
  try {
    const q = await yf.quote(sym)
    price = typeof q?.regularMarketPrice === 'number' ? q.regularMarketPrice : null
  } catch {
    price = null
  }

  quoteCache.set(sym, { value: price, expires: Date.now() + QUOTE_TTL })
  return price
}

/**
 * Fetch quotes for many symbols in parallel, returned as a symbol -> price map.
 */
export async function getQuotes(
  symbols: string[],
): Promise<Record<string, number | null>> {
  const unique = [...new Set(symbols.map(normalize))]
  const entries = await Promise.all(
    unique.map(async (sym) => [sym, await getQuote(sym)] as const),
  )
  return Object.fromEntries(entries)
}

/**
 * Daily closing prices for the last `days` days. Empty array on any error.
 */
export async function getHistory(
  symbol: string,
  days = 180,
): Promise<HistoryPoint[]> {
  const sym = normalize(symbol)
  const cacheKey = `${sym}:${days}`
  const cached = historyCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.value

  let points: HistoryPoint[] = []
  try {
    const period1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const result = await yf.chart(sym, { period1, interval: '1d' })
    points = (result?.quotes ?? [])
      .filter((q) => q.date != null && typeof q.close === 'number')
      .map((q) => ({
        date: new Date(q.date as Date).toISOString().slice(0, 10),
        close: q.close as number,
      }))
  } catch {
    points = []
  }

  historyCache.set(cacheKey, { value: points, expires: Date.now() + HISTORY_TTL })
  return points
}
