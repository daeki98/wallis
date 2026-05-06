"use client";

import { useTransition } from "react";
import type { Word } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { updateWord } from "@/app/actions";
import { toast } from "sonner";

export function EditWordDialog({
  word,
  open,
  onOpenChange,
}: {
  word: Word;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateWord(word.id, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Aktualisiert");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Wort bearbeiten</DialogTitle>
            <DialogDescription>
              Änderungen werden für alle sichtbar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={`wort-${word.id}`}>Walliserwort *</Label>
              <Input
                id={`wort-${word.id}`}
                name="wort"
                required
                defaultValue={word.wort}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`hochdeutsch-${word.id}`}>Hochdeutsch *</Label>
              <Input
                id={`hochdeutsch-${word.id}`}
                name="hochdeutsch"
                required
                defaultValue={word.hochdeutsch}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`beispielsatz-${word.id}`}>Beispielsatz</Label>
              <Textarea
                id={`beispielsatz-${word.id}`}
                name="beispielsatz"
                defaultValue={word.beispielsatz || ""}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`region-${word.id}`}>Region</Label>
              <Input
                id={`region-${word.id}`}
                name="region"
                defaultValue={word.region || ""}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
