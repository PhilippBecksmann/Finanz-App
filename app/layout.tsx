import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Personal Finance & Portfolio',
  description: 'Cashflow-Tracking, Portfolio und Net Worth an einem Ort.',
}

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/transactions', label: 'Cashflow' },
  { href: '/portfolio', label: 'Portfolio' },
]

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <span className="text-lg font-semibold tracking-tight">💰 Finance</span>
            <nav className="flex gap-1 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 font-medium text-muted hover:bg-background hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
