import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

// Build dates relative to "now" so the dashboard always shows recent activity.
function daysAgo(n: number): Date {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

async function main() {
  // Start from a clean slate so re-seeding is idempotent.
  await prisma.transaction.deleteMany()
  await prisma.asset.deleteMany()

  await prisma.transaction.createMany({
    data: [
      { amount: 3200, type: 'INCOME', category: 'Gehalt', date: daysAgo(40), isRecurring: true, note: 'Monatsgehalt' },
      { amount: 3200, type: 'INCOME', category: 'Gehalt', date: daysAgo(10), isRecurring: true, note: 'Monatsgehalt' },
      { amount: 250, type: 'INCOME', category: 'Sonstiges', date: daysAgo(20), isRecurring: false, note: 'Verkauf gebraucht' },
      { amount: 1100, type: 'EXPENSE', category: 'Miete', date: daysAgo(38), isRecurring: true, note: null },
      { amount: 1100, type: 'EXPENSE', category: 'Miete', date: daysAgo(8), isRecurring: true, note: null },
      { amount: 320, type: 'EXPENSE', category: 'Essen', date: daysAgo(30), isRecurring: false, note: 'Wocheneinkauf' },
      { amount: 210, type: 'EXPENSE', category: 'Essen', date: daysAgo(5), isRecurring: false, note: 'Wocheneinkauf' },
      { amount: 12.99, type: 'EXPENSE', category: 'Abo', date: daysAgo(15), isRecurring: true, note: 'Streaming' },
      { amount: 49.99, type: 'EXPENSE', category: 'Abo', date: daysAgo(15), isRecurring: true, note: 'Fitnessstudio' },
      { amount: 85, type: 'EXPENSE', category: 'Transport', date: daysAgo(12), isRecurring: false, note: 'Tanken' },
      { amount: 60, type: 'EXPENSE', category: 'Freizeit', date: daysAgo(3), isRecurring: false, note: 'Kino & Restaurant' },
    ],
  })

  await prisma.asset.createMany({
    data: [
      { symbol: 'AAPL', shares: 10, buyPrice: 150, currency: 'EUR' },
      { symbol: 'MSFT', shares: 5, buyPrice: 320, currency: 'EUR' },
      { symbol: 'SAP.DE', shares: 8, buyPrice: 190, currency: 'EUR' },
    ],
  })

  const txCount = await prisma.transaction.count()
  const assetCount = await prisma.asset.count()
  console.log(`Seed complete: ${txCount} transactions, ${assetCount} assets.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
