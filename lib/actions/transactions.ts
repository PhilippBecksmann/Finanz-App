'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export type ActionResult = { ok: boolean; error?: string }

const VALID_TYPES = ['INCOME', 'EXPENSE'] as const

export async function addTransaction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const amount = Number(formData.get('amount'))
  const type = String(formData.get('type') ?? '')
  const category = String(formData.get('category') ?? '').trim()
  const dateStr = String(formData.get('date') ?? '')
  const note = String(formData.get('note') ?? '').trim()
  const isRecurring = formData.get('isRecurring') === 'on'

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'Betrag muss eine positive Zahl sein.' }
  }
  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return { ok: false, error: 'Ungültiger Typ.' }
  }
  if (!category) {
    return { ok: false, error: 'Kategorie ist erforderlich.' }
  }
  const date = dateStr ? new Date(dateStr) : new Date()
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: 'Ungültiges Datum.' }
  }

  await prisma.transaction.create({
    data: {
      amount: Math.abs(amount),
      type,
      category,
      date,
      isRecurring,
      note: note || null,
    },
  })

  revalidatePath('/transactions')
  revalidatePath('/')
  return { ok: true }
}

// Used directly as a <form action>, so it must resolve to void.
export async function deleteTransaction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  await prisma.transaction.delete({ where: { id } })

  revalidatePath('/transactions')
  revalidatePath('/')
}
