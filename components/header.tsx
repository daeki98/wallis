import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/avatar";
import { signOut } from "@/app/actions";
import { LogIn, LogOut, User } from "lucide-react";

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
      .single();
    profile =
      data ?? {
        display_name: user.email?.split("@")[0] ?? "Profil",
        avatar_url: null,
      };
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/wappen.png"
            alt="Walliser Wappen"
            width={22}
            height={22}
            className="rounded-[3px] shadow-sm ring-1 ring-border/60"
            priority
          />
          <span className="text-sm font-semibold tracking-tight">Wallis</span>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 pl-1.5 pr-2"
                  >
                    <Avatar
                      name={profile.display_name}
                      src={profile.avatar_url}
                      size={22}
                    />
                    <span className="hidden sm:inline">
                      {profile.display_name}
                    </span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={profile.display_name}
                      src={profile.avatar_url}
                      size={32}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {profile.display_name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <Link href="/profil" className="cursor-pointer">
                      <User className="size-4" />
                      Profil
                    </Link>
                  }
                />
                <DropdownMenuSeparator />
                <form action={signOut}>
                  <DropdownMenuItem
                    render={
                      <button
                        type="submit"
                        className="w-full cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        Abmelden
                      </button>
                    }
                  />
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
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
