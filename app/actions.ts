"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getDisplayName(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, email: string | undefined) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();
  return profile?.display_name || email?.split("@")[0] || "Unbekannt";
}

export async function addWord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du musst eingeloggt sein." };

  const wort = String(formData.get("wort") || "").trim();
  const bedeutung = String(formData.get("bedeutung") || "").trim();

  if (!wort || !bedeutung) {
    return { error: "Wort und Bedeutung sind erforderlich." };
  }

  const addedBy = await getDisplayName(supabase, user.id, user.email);

  const { error } = await supabase.from("words").insert({
    wort,
    bedeutung,
    added_by: addedBy,
    user_id: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function updateWord(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du musst eingeloggt sein." };

  const wort = String(formData.get("wort") || "").trim();
  const bedeutung = String(formData.get("bedeutung") || "").trim();

  if (!wort || !bedeutung) {
    return { error: "Wort und Bedeutung sind erforderlich." };
  }

  const { error } = await supabase
    .from("words")
    .update({ wort, bedeutung })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function deleteWord(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du musst eingeloggt sein." };

  const { error } = await supabase.from("words").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du musst eingeloggt sein." };

  const displayName = String(formData.get("display_name") || "").trim();
  if (!displayName) return { error: "Name darf nicht leer sein." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) return { error: error.message };

  // Sync added_by auf alle bisherigen Wörter dieses Users
  await supabase
    .from("words")
    .update({ added_by: displayName })
    .eq("user_id", user.id);

  revalidatePath("/", "layout");
  return { success: true };
}

const KATZEN = [
  "/katzen/katze1.jpg",
  "/katzen/katze2.jpg",
  "/katzen/katze3.jpg",
  "/katzen/katze4.jpg",
  "/katzen/katze5.jpg",
  "/katzen/katze6.jpg",
];

export async function rerollAvatar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du musst eingeloggt sein." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Pick aus den anderen Katzen — garantiert nicht dieselbe wie jetzt
  const pool = KATZEN.filter((p) => p !== profile?.avatar_url);
  const next = pool[Math.floor(Math.random() * pool.length)];

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: next })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true, avatar: next };
}

export async function setAvatar(avatarPath: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du musst eingeloggt sein." };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarPath })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
