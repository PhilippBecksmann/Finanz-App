# Finanz-App

Persönliche Finanz- und Portfolio-App: Einnahmen und Ausgaben erfassen, Depotwerte mit Live-Kursen verfolgen und alles in einem Dashboard auswerten.

## Features

- **Dashboard** mit Kontostand, Portfoliowert, Ausgaben nach Kategorie (Kreisdiagramm) und Wertverlauf des Depots (Liniendiagramm)
- **Transaktionen**: Einnahmen und Ausgaben, wiederkehrende Buchungen, Notizen, Monatsfilter
- **Portfolio**: Positionen mit Stückzahl und Kaufpreis, aktuelle Kurse über Yahoo Finance, Gewinn/Verlust

## Tech Stack

`Next.js` `React` `TypeScript` `Tailwind CSS` `Prisma` `SQLite` `Recharts` `yahoo-finance2`

## Lokal starten

```bash
npm install
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma migrate dev     # Datenbank anlegen
npx prisma db seed         # optional: Beispieldaten
npm run dev
```

Danach [http://localhost:3000](http://localhost:3000) öffnen.

## Struktur

- `app/` – Seiten (Dashboard, Transaktionen, Portfolio)
- `components/` – UI- und Diagramm-Komponenten
- `lib/` – Berechnungen, Kursabfrage, Server Actions
- `prisma/` – Schema, Migrationen, Seed

## Was ich dabei gelernt habe

Server Actions in Next.js, Datenmodellierung mit Prisma, Anbindung einer externen Kurs-API und Visualisierung mit Recharts.
