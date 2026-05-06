"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function LoginForm({
  error,
  sent,
}: {
  error?: string;
  sent?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setLocalError(error.message);
        return;
      }
      router.replace("/login?sent=1");
    });
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center space-y-3">
        <CheckCircle2 className="mx-auto size-8 text-emerald-500" />
        <div className="space-y-1">
          <p className="font-medium">Magic-Link gesendet</p>
          <p className="text-sm text-muted-foreground">
            Schau in dein Postfach und klick den Link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="du@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          autoFocus
        />
      </div>

      {(localError || error) && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{localError || "Login fehlgeschlagen, bitte erneut versuchen."}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Wird gesendet...
          </>
        ) : (
          "Magic-Link senden"
        )}
      </Button>
    </form>
  );
}
