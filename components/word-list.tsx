"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Word } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { WordCard } from "@/components/word-card";
import { Search } from "lucide-react";

export function WordList({
  words,
  canEdit,
}: {
  words: Word[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initial);

  // Sync query → URL with light debounce so refresh keeps the filter.
  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = query.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      const next = params.toString();
      router.replace(next ? `/?${next}` : "/", { scroll: false });
    }, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter(
      (w) =>
        w.wort.toLowerCase().includes(q) ||
        w.bedeutung.toLowerCase().includes(q) ||
        w.added_by.toLowerCase().includes(q),
    );
  }, [words, query]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {query
              ? `Kein Wort passt zu „${query}"`
              : "Noch keine Wörter — leg los und füg eins hinzu."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((word) => (
            <li key={word.id}>
              <WordCard word={word} canEdit={canEdit} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
