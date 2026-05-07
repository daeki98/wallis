/**
 * Returns the canonical site origin (no trailing slash) for building
 * absolute URLs in auth flows, emails, etc.
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_SITE_URL` env var (set this in Vercel to production URL)
 * 2. Vercel-provided `NEXT_PUBLIC_VERCEL_URL` (deployment-specific URL)
 * 3. Caller-provided fallback (typically `window.location.origin`
 *    on the client, or `request.url` origin on the server)
 */
export function getSiteUrl(fallback?: string): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return (fallback ?? "").replace(/\/+$/, "");
}
