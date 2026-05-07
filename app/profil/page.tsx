import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import type { Profile } from "@/lib/types";

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profil");

  // Try to load existing profile (no error if missing)
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Bootstrap a profile if it doesn't exist yet (e.g. user was created
  // before the auth trigger was in place, or trigger lagged)
  if (!profile) {
    const fallbackName =
      (user.user_metadata?.name as string | undefined) ||
      user.email?.split("@")[0] ||
      "Profil";

    const { data: created, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: fallbackName }, { onConflict: "id" })
      .select("*")
      .single();

    if (error || !created) {
      console.error("Failed to bootstrap profile:", error);
      redirect("/?error=profile-bootstrap");
    }
    profile = created;
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12 sm:py-16">
      <section className="mb-8 space-y-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Profil
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Dein Profil</h1>
        <p className="text-sm text-muted-foreground">
          Dein Username erscheint bei jedem Wort das du hinzufügst — Änderungen werden
          rückwirkend übernommen.
        </p>
      </section>

      <ProfileForm profile={profile as Profile} email={user.email!} />
    </main>
  );
}
