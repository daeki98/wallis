import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/avatar";
import { LogIn, Trophy } from "lucide-react";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { display_name: string; avatar_url: string | null } | null =
    null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    profile =
      data ?? {
        display_name: user.email?.split("@")[0] ?? "Profil",
        avatar_url: null,
      };
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
        <div className="flex items-center gap-1">
          <Link
            href="/"
            aria-label="Wallis — Startseite"
            className="inline-flex items-center mr-2"
          >
            <Image
              src="/wappen.png"
              alt="Walliser Wappen"
              width={26}
              height={26}
              className="rounded-[3px] shadow-sm ring-1 ring-border/60"
              priority
            />
          </Link>
          <Link
            href="/rangliste"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trophy className="size-4" />
            <span className="hidden sm:inline">Rangliste</span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user && profile ? (
            <Link
              href="/profil"
              className="group inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted"
              aria-label="Profil bearbeiten"
            >
              <Avatar
                name={profile.display_name}
                src={profile.avatar_url}
                size={26}
              />
              <span className="hidden sm:inline font-medium">
                {profile.display_name}
              </span>
            </Link>
          ) : (
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <LogIn className="size-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
