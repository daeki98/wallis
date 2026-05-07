"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from "lucide-react";

type Method = "password" | "magic";

export function LoginForm({ error }: { error?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState<Method | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  const run = (method: Method, fn: () => Promise<void>) => {
    setLocalError(null);
    setActive(method);
    startTransition(async () => {
      try {
        await fn();
      } finally {
        setActive(null);
      }
    });
  };

  const onPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setLocalError("Passwort fehlt — oder nimm den Magic-Link unten.");
      return;
    }
    run("password", async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLocalError(
          error.message.toLowerCase().includes("invalid")
            ? "Falsche E-Mail oder Passwort."
            : error.message,
        );
        return;
      }
      router.replace("/");
      router.refresh();
    });
  };

  const onMagicLink = () => {
    if (!email) {
      setLocalError("E-Mail fehlt für den Magic-Link.");
      return;
    }
    run("magic", async () => {
      const supabase = createClient();
      const baseUrl = getSiteUrl(window.location.origin);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${baseUrl}/auth/callback` },
      });
      if (error) {
        setLocalError(error.message);
        return;
      }
      setMagicSent(true);
    });
  };

  if (magicSent) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center space-y-3">
        <CheckCircle2 className="mx-auto size-8 text-emerald-500" />
        <div className="space-y-1">
          <p className="font-medium">Magic-Link gesendet</p>
          <p className="text-sm text-muted-foreground">
            Schau in dein Postfach <span className="font-mono">{email}</span>{" "}
            und klick den Link.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMagicSent(false)}
          className="mt-2"
        >
          Zurück zum Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onPasswordSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="du@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={
              showPassword ? "Passwort verbergen" : "Passwort anzeigen"
            }
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      {(localError || error) && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>
            {localError || "Login fehlgeschlagen, bitte erneut versuchen."}
          </span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {active === "password" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Einloggen...
          </>
        ) : (
          "Einloggen"
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full gap-2 text-sm text-muted-foreground"
        onClick={onMagicLink}
        disabled={isPending}
      >
        {active === "magic" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        Stattdessen Magic-Link senden
      </Button>
    </form>
  );
}
