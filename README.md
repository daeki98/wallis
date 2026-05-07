# Wallis

Walliser Wörter, Tradition, Rezepte. Eine wachsende Sammlung, gepflegt von Soraya und Pascal.

**Live:** [https://walliser.vercel.app](https://walliser.vercel.app)

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui (Base UI) · Supabase (DB + Auth + Storage) · Vercel

## Features

- Öffentliche Wortliste mit Live-Suche (URL-persistent, Refresh behält den Filter)
- Magic-Link-Login (kein Passwort)
- Persistente Profile mit Profilbild (Supabase Storage)
- Add/Edit/Delete von Wörtern für eingeloggte Admins
- Auto-Keepalive (Vercel Cron alle 5 Tage), damit Supabase Free-Tier nicht pausiert
- Dark/Light Theme · Mobile-first

## Lokale Entwicklung

```bash
git clone https://github.com/daeki98/wallis.git
cd wallis
cp .env.example .env.local    # dann Werte eintragen
npm install
npm run dev                   # http://localhost:3000
```

## Environment Variables

| Variable | Wo | Wert |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | `https://<project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local` + Vercel | `sb_publishable_...` |
| `NEXT_PUBLIC_SITE_URL` | nur Vercel | `https://walliser.vercel.app` |

`NEXT_PUBLIC_SITE_URL` ist optional aber wichtig für Production: damit gehen Magic-Link-Mails immer zur Live-Seite, egal von wo der Login angefragt wurde. Lokal weglassen — dann nimmt's `window.location.origin` (= `localhost:3000`).

## Datenbank-Migrations

Schema-Änderungen liegen versioniert in `supabase/migrations/`. Workflow:

```bash
# Einmalig:
supabase login --token sbp_DEIN_TOKEN
npm run db:link             # linkt zum Projekt

# Neue Migration:
supabase migration new my_change
# → Datei in supabase/migrations/<timestamp>_my_change.sql editieren

# Anwenden:
npm run db:push

# TypeScript-Typen aus Remote-DB ziehen:
npm run db:types            # → lib/database.types.ts
```

Migrations sind **idempotent** geschrieben (`if not exists`, `drop policy if exists`) — können beliebig oft laufen.

## Auth-Setup (Supabase Dashboard)

**Authentication → URL Configuration:**
- **Site URL**: `https://walliser.vercel.app`
- **Redirect URLs**: `https://walliser.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`

**Authentication → Users**:
- Pascal + Soraya hinzufügen mit "Auto Confirm User" angehakt — sonst kommt der "Confirm Signup" statt "Magic Link" Email.

**Authentication → Email Templates → Magic Link** (optional anpassen, Standard ist Englisch):
```html
<h2>Wallis-Login</h2>
<p>Klick auf den Link um dich einzuloggen:</p>
<p><a href="{{ .ConfirmationURL }}">Einloggen</a></p>
```

## Vercel-Setup

1. GitHub-Repo `daeki98/wallis` mit Vercel verbinden.
2. **Settings → Environment Variables**: alle drei Vars setzen (siehe oben), in allen drei Environments anhaken.
3. **Settings → Build & Development**: Framework auf **Next.js** stellen (Vercel erkennt's normalerweise auto, aber explizit ist sicherer).
4. **Settings → Deployment Protection → Vercel Authentication**: auf "Only Preview Deployments" — sonst ist Production hinter Login versteckt.
5. **Settings → Domains**: `walliser.vercel.app` als Production-Domain.

## Struktur

```
app/
  page.tsx              Wortliste + Live-Suche
  login/                Magic-Link-Login
  profil/               Profilseite (Avatar-Upload, Name)
  auth/callback/        Magic-Link Redirect-Handler
  api/keepalive/        Cron-Endpoint gegen Supabase-Pause
  actions.ts            Server Actions
components/
  word-list.tsx         URL-persistente Suche
  word-card.tsx         Wort + Edit/Delete on hover
  add/edit-word-dialog  Wort-CRUD
  header.tsx            Sticky-Header mit Wappen, Avatar, Theme
  avatar.tsx            Storage-URL-Helper + Avatar-Komponente
  theme-*.tsx           Dark/Light Mode
  ui/                   shadcn/ui-Komponenten (Base UI)
lib/
  supabase/             Browser-, Server-, Proxy-Clients
  site-url.ts           Canonical Origin Resolver
  types.ts              `Word`, `Profile`
  format.ts             Relative Zeit (de-CH)
proxy.ts                Session-Refresh (Next.js 16 Middleware)
supabase/
  config.toml           Supabase-CLI-Config
  migrations/           Versionierte SQL-Migrations
vercel.json             Cron-Config (keepalive)
public/wappen.png       Walliser Wappen-Logo
```

## Sicherheit

- Wörter und Profile sind **public read** (für Besucher sichtbar).
- Nur eingeloggte User dürfen Wörter ändern.
- Profile: jeder ändert nur sein eigenes (RLS auf `auth.uid() = id`).
- Avatare im Storage-Bucket nach `<user_id>/avatar-*.ext` — nur eigener Owner darf hochladen/löschen.
- `sb_publishable_*` ist designt um öffentlich zu sein — Schutz kommt aus den RLS-Policies in der DB.

## Roadmap

- [x] Walliser Wörter
- [ ] Walliser Rezepte (separate Route `app/rezepte/` + eigene Tabelle)
- [ ] Weitere traditionelle Inhalte
