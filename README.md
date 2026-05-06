# Wallis

Walliser Wörter, Tradition, Rezepte. Eine wachsende Sammlung, gepflegt von Soraya und Pascal.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Supabase · Vercel

## Setup

### 1. Supabase

1. Im Supabase-Projekt unter **SQL Editor** den Inhalt von [`supabase/schema.sql`](supabase/schema.sql) einmal ausführen.
2. Unter **Authentication → Providers → Email** sicherstellen, dass Magic Link aktiviert ist.
3. Unter **Authentication → URL Configuration**:
   - **Site URL**: `https://wallis.vercel.app` (oder die Vercel-URL deines Deployments)
   - **Redirect URLs**: füge `http://localhost:3000/auth/callback` und `https://<deine-vercel-url>/auth/callback` hinzu.
4. Soraya und Pascal als Users anlegen (Authentication → Users → Add user → mit E-Mail). Beim ersten Login bekommt jede(r) einen Magic-Link-Mail.

### 2. Lokal entwickeln

```bash
npm install
npm run dev
```

`.env.local` ist bereits gesetzt mit der Supabase-Project-URL und dem Publishable-Key.

### 3. Vercel

- Repo `daeki98/wallis` mit Vercel verbinden.
- In Vercel **Settings → Environment Variables** dieselben zwei Vars eintragen wie in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Deploy. Vercel baut bei jedem `git push` neu.

## Struktur

```
app/
  page.tsx              Wortliste (öffentlich lesbar)
  login/                Magic-Link-Login
  auth/callback/        OAuth/Magic-Link Redirect-Handler
  actions.ts            Server Actions (add/update/delete)
components/
  word-list.tsx         Live-Suche
  word-card.tsx         Einzelnes Wort + Edit/Delete on hover
  add-word-dialog.tsx   Wort hinzufügen (Dialog)
  edit-word-dialog.tsx  Wort bearbeiten
  header.tsx            Sticky-Header mit Login/Theme
  ui/                   shadcn/ui-Komponenten
lib/
  supabase/             Browser-, Server- und Proxy-Clients
  types.ts              `Word`-Typ
  format.ts             Relative Zeitangaben (de-CH)
proxy.ts                Session-Refresh (Next.js 16 Middleware)
supabase/schema.sql     DB-Schema + Row-Level-Security
```

## Sicherheit

- Alle dürfen Wörter **lesen** (öffentlich).
- Nur **eingeloggte** User dürfen schreiben/ändern/löschen (RLS auf DB-Ebene).
- Der `sb_publishable_*` Key ist designt um öffentlich zu sein — Sicherheit kommt durch RLS.

## Roadmap

- [x] Walliser Wörter
- [ ] Walliser Rezepte
- [ ] Weitere traditionelle Inhalte
