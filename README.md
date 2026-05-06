# Wallis

Walliser Wörter, Tradition, Rezepte. Eine wachsende Sammlung, gepflegt von Soraya und Pascal.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Supabase (DB + Auth + Storage) · Vercel

## Features

- Öffentliche Wortliste mit Live-Suche (URL-persistent: Refresh behält den Filter)
- Magic-Link Login (kein Passwort)
- Persistente Profile mit Profilbild (Supabase Storage)
- Add/Edit/Delete von Wörtern für eingeloggte Admins
- Dark/Light Theme · Mobile-first

## Setup

### 1. Supabase

Einmalig:

1. **DB-Migration anwenden** — entweder über die CLI (siehe unten) oder den Inhalt von `supabase/migrations/20260506190000_init_schema.sql` einmal im **SQL Editor** ausführen.
2. **Authentication → Providers → Email**: Magic Link aktivieren.
3. **Authentication → URL Configuration**:
   - **Site URL**: `https://<deine-vercel-url>` (z.B. `https://wallis.vercel.app`)
   - **Redirect URLs**: füg `http://localhost:3000/auth/callback` und `https://<deine-vercel-url>/auth/callback` hinzu.
4. **Authentication → Users → Add user** für Soraya und Pascal mit jeweiliger E-Mail. Beim ersten Login bekommt jede(r) einen Magic-Link.

### 2. Lokal

```bash
npm install
npm run dev      # http://localhost:3000
```

`.env.local` ist bereits gesetzt. Für andere Maschinen siehe `.env.example`.

### 3. Vercel

- Repo `daeki98/wallis` mit Vercel verbinden.
- In **Vercel → Settings → Environment Variables** dieselben Vars wie in `.env.local` eintragen:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Deploy. Vercel baut bei jedem `git push` neu.

## Datenbank-Workflow (versionskontrollierte Migrations)

Die DB-Schema-Änderungen liegen als SQL-Migrations in `supabase/migrations/`. Damit ist jede Änderung committbar und reproduzierbar.

### Einmalige Einrichtung

```bash
npx supabase login          # öffnet Browser zur Auth
npm run db:link             # linkt zum Projekt dkypxhiwbiptlguviyeq
```

Dabei wird das DB-Passwort einmal abgefragt (du findest es in Supabase → Project Settings → Database).

### Schema ändern

Variante A — Migration manuell schreiben:

```bash
# Neue Migration anlegen
npx supabase migration new add_xyz
# → erzeugt supabase/migrations/<timestamp>_add_xyz.sql
# Datei editieren, dann:
npm run db:push
```

Variante B — DB-Diff vom Remote ziehen (z.B. wenn du im Studio etwas geändert hast):

```bash
npm run db:diff -- name_for_migration   # erstellt Migration aus den Änderungen
npm run db:push                         # wendet sie an
```

### TypeScript-Typen aus DB generieren

```bash
npm run db:types        # → lib/database.types.ts
```

## Struktur

```
app/
  page.tsx              Wortliste mit Live-Suche (URL-Param ?q=)
  login/                Magic-Link-Login
  profil/               Profilseite (Avatar-Upload, Name)
  auth/callback/        Magic-Link Redirect-Handler
  actions.ts            Server Actions (add/update/delete word, profile)
components/
  word-list.tsx         Liste mit URL-persistenter Suche
  word-card.tsx         Wort-Card + Edit/Delete on hover
  add-word-dialog.tsx   Wort hinzufügen
  edit-word-dialog.tsx  Wort bearbeiten
  header.tsx            Sticky Header mit Avatar, Theme, Profil-Link
  avatar.tsx            Avatar-Komponente (Storage-Url-Helper)
  ui/                   shadcn/ui-Komponenten
lib/
  supabase/             Browser-, Server-, Proxy-Clients
  types.ts              `Word`, `Profile`
  format.ts             Relative Zeit (de-CH)
proxy.ts                Session-Refresh (Next.js 16 Middleware)
supabase/
  config.toml           Supabase-CLI-Config
  migrations/           Versionierte SQL-Migrations
```

## Sicherheit

- Alle dürfen Wörter und Profile **lesen** (öffentlich).
- Nur **eingeloggte User** dürfen Wörter schreiben/ändern/löschen.
- Profile: jeder kann nur **sein eigenes** ändern.
- Avatare im `avatars`-Storage-Bucket, organisiert nach `user_id/avatar-*.ext`. Nur der eigene Owner darf hochladen/löschen.
- Der `sb_publishable_*` Key ist öffentlich-safe — Schutz kommt aus den RLS-Policies in der DB.

## Roadmap

- [x] Walliser Wörter
- [ ] Walliser Rezepte (geplant: separate Route `app/rezepte/` + eigene Tabelle)
- [ ] Weitere traditionelle Inhalte
