"use client";

import { useState, useTransition } from "react";
import type { Word } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { deleteWord } from "@/app/actions";
import { EditWordDialog } from "@/components/edit-word-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatRelative } from "@/lib/format";

export function WordCard({
  word,
  canEdit,
}: {
  word: Word;
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  const onDelete = () => {
    if (!confirm(`„${word.wort}" wirklich löschen?`)) return;
    startTransition(async () => {
      const result = await deleteWord(word.id);
      if (result.error) toast.error(result.error);
      else toast.success("Gelöscht");
    });
  };

  return (
    <article className="group relative rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-border hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h3 className="text-lg font-semibold tracking-tight">
              {word.wort}
            </h3>
            <span className="text-sm text-muted-foreground">
              {word.bedeutung}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1.5 text-xs text-muted-foreground">
            <span className="font-medium">{word.added_by}</span>
            <span aria-hidden>·</span>
            <time dateTime={word.created_at}>
              {formatRelative(word.created_at)}
            </time>
          </div>
        </div>

        {canEdit && (
          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setEditOpen(true)}
              aria-label="Bearbeiten"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              disabled={isPending}
              aria-label="Löschen"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      {canEdit && (
        <EditWordDialog
          word={word}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </article>
  );
}
