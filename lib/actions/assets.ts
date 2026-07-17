'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export type ActionResult = { ok: boolean; error?: string }

export async function addAsset(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const symbol = String(formData.get('symbol') ?? '').trim().toUpperCase()
  const shares = Number(formData.get('shares'))
  const buyPrice = Number(formData.get('buyPrice'))

  if (!symbol) {
    return { ok: false, error: 'Ticker-Symbol ist erforderlich.' }
  }
  if (!Number.isFinite(shares) || shares <= 0) {
    return { ok: false, error: 'Anzahl muss eine positive Zahl sein.' }
  }
  if (!Number.isFinite(buyPrice) || buyPrice <= 0) {
    return { ok: false, error: 'Kaufpreis muss eine positive Zahl sein.' }
  }

  await prisma.asset.create({
    data: { symbol, shares, buyPrice, currency: 'EUR' },
  })

  revalidatePath('/portfolio')
  revalidatePath('/')
  return { ok: true }
}

// Used directly as a <form action>, so it must resolve to void.
export async function deleteAsset(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  await prisma.asset.delete({ where: { id } })

  revalidatePath('/portfolio')
  revalidatePath('/')
}
