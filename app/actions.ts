"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addWord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Du musst eingeloggt sein." };
  }

  const wort = String(formData.get("wort") || "").trim();
  const hochdeutsch = String(formData.get("hochdeutsch") || "").trim();
  const beispielsatz =
    String(formData.get("beispielsatz") || "").trim() || null;
  const region = String(formData.get("region") || "").trim() || null;

  if (!wort || !hochdeutsch) {
    return { error: "Wort und Hochdeutsch sind erforderlich." };
  }

  const addedBy =
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Unbekannt";

  const { error } = await supabase.from("words").insert({
    wort,
    hochdeutsch,
    beispielsatz,
    region,
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
  const hochdeutsch = String(formData.get("hochdeutsch") || "").trim();
  const beispielsatz =
    String(formData.get("beispielsatz") || "").trim() || null;
  const region = String(formData.get("region") || "").trim() || null;

  if (!wort || !hochdeutsch) {
    return { error: "Wort und Hochdeutsch sind erforderlich." };
  }

  const { error } = await supabase
    .from("words")
    .update({ wort, hochdeutsch, beispielsatz, region })
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
