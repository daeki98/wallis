import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/utils";

export const revalidate = 0;

type Ranking = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  word_count: number;
  last_word_at: string | null;
};

export default async function RanglistePage() {
  const supabase = await createClient();
  const { data: rankings } = await supabase
    .from("user_rankings")
    .select("*")
    .gt("word_count", 0)
    .order("word_count", { ascending: false })
    .limit(20);

  const list = (rankings ?? []) as Ranking[];
  const max = list[0]?.word_count ?? 1;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Zurück
      </Link>

      <section className="mb-10 space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Rangliste
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Top Beiträge
        </h1>
        <p className="text-muted-foreground">
          Wer hat am meisten Walliserwörter beigesteuert.
        </p>
      </section>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Trophy className="size-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Noch keine Wörter — sei du der erste.
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {list.map((u, i) => (
            <li key={u.id}>
              <RankRow rank={i + 1} user={u} max={max} />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function RankRow({
  rank,
  user,
  max,
}: {
  rank: number;
  user: Ranking;
  max: number;
}) {
  const ratio = max > 0 ? user.word_count / max : 0;
  const isTop = rank === 1;
  const rankColor =
    rank === 1
      ? "text-amber-500"
      : rank === 2
        ? "text-zinc-400"
        : rank === 3
          ? "text-amber-700/80"
          : "text-muted-foreground";

  return (
    <article
      className={cn(
        "grid grid-cols-[2.5rem_2.25rem_1fr_auto] items-center gap-4 rounded-xl border bg-card p-4 transition-all",
        isTop
          ? "border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-card shadow-sm dark:from-amber-950/20"
          : "border-border/60 hover:border-border hover:shadow-sm",
      )}
    >
      <span
        className={cn(
          "font-mono text-2xl font-semibold tabular-nums tracking-tight",
          rankColor,
        )}
      >
        {rank}
      </span>

      <Avatar
        name={user.display_name}
        src={user.avatar_url}
        size={36}
      />

      <div className="min-w-0 space-y-1.5">
        <p className="truncate text-sm font-medium">{user.display_name}</p>
        <div className="h-1 w-full max-w-40 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isTop ? "bg-amber-500" : "bg-foreground/40",
            )}
            style={{ width: `${Math.max(ratio * 100, 4)}%` }}
          />
        </div>
      </div>

      <div className="text-right">
        <span className="font-mono text-lg font-semibold tabular-nums">
          {user.word_count}
        </span>
        <span className="ml-1 text-xs text-muted-foreground">
          {user.word_count === 1 ? "Wort" : "Wörter"}
        </span>
      </div>
    </article>
  );
}
