import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Hits Supabase every 5 days so the free-tier project never auto-pauses.
// Triggered by the cron in vercel.json.
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { count, error } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    ok: !error,
    words: count ?? null,
    error: error?.message ?? null,
    timestamp: new Date().toISOString(),
  });
}
