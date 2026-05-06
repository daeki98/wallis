import { createClient } from "@/lib/supabase/server";
import type { Word } from "@/lib/types";
import { WordList } from "@/components/word-list";
import { AddWordDialog } from "@/components/add-word-dialog";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  const [{ data: words }, userResult] = await Promise.all([
    supabase
      .from("words")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const isLoggedIn = !!userResult.data.user;
  const list = (words ?? []) as Word[];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <section className="mb-10 space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Walliser Mundart
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Wörter aus dem Wallis
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Eine wachsende Sammlung von Walliserwörtern.{" "}
          <span className="font-mono text-foreground">{list.length}</span>{" "}
          {list.length === 1 ? "Wort" : "Wörter"} bisher.
        </p>
      </section>

      {isLoggedIn && (
        <div className="mb-6 flex justify-end">
          <AddWordDialog />
        </div>
      )}

      <WordList words={list} canEdit={isLoggedIn} />
    </main>
  );
}
