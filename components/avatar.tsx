const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function getAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
}

export function Avatar({
  name,
  src,
  size = 32,
  className = "",
}: {
  name: string;
  src: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const url = getAvatarUrl(src);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground ring-1 ring-border ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          width={size}
          height={size}
          className="size-full object-cover"
        />
      ) : (
        <span className="font-medium">{initial}</span>
      )}
    </span>
  );
}
