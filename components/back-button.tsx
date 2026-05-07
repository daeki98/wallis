"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "") return null;

  return (
    <Link
      href="/"
      aria-label="Zurück zur Startseite"
      className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
    </Link>
  );
}
