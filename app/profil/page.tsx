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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12 sm:py-16">
      <section className="mb-8 space-y-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Profil
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Dein Profil
        </h1>
        <p className="text-sm text-muted-foreground">
          Wie soll dein Name auf den Wörtern erscheinen?
        </p>
      </section>

      <ProfileForm profile={profile as Profile} email={user.email!} />
    </main>
  );
}
