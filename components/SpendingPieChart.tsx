'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatEUR } from '@/lib/calc'

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
]

type Slice = { category: string; total: number }

export function SpendingPieChart({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-muted">
        Noch keine Ausgaben erfasst.
      </p>
    )
  }

  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="h-56 w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown) => formatEUR(Number(value))}
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--foreground)',
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend doubles as the table view: identity is never color-alone. */}
      <ul className="flex w-full flex-col gap-2 text-sm sm:w-1/2">
        {data.map((d, i) => (
          <li key={d.category} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1">{d.category}</span>
            <span className="tabular-nums text-muted">
              {total > 0 ? Math.round((d.total / total) * 100) : 0}%
            </span>
            <span className="w-24 text-right font-medium tabular-nums">
              {formatEUR(d.total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
