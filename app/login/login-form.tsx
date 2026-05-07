"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  Sparkles,
} from "lucide-react";

type Mode = "login" | "register";
type Method = "password" | "magic";

export function LoginForm({ error }: { error?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState<Method | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [registerSent, setRegisterSent] = useState(false);

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setLocalError("Passwort fehlt — oder nimm den Magic-Link unten.");
      return;
    }
    if (mode === "register" && password.length < 8) {
      setLocalError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    run("password", async () => {
      const supabase = createClient();
      const baseUrl = getSiteUrl(window.location.origin);

      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${baseUrl}/auth/callback` },
        });
        if (error) {
          setLocalError(error.message);
          return;
        }
        // Wenn Email-Bestätigung aktiv: session ist null, user muss Mail bestätigen
        if (!data.session) {
          setRegisterSent(true);
          return;
        }
        router.replace("/");
        router.refresh();
        return;
      }

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

  if (magicSent || registerSent) {
    const Icon = registerSent ? MailCheck : CheckCircle2;
    const title = registerSent
      ? "Account erstellt — bestätige deine E-Mail"
      : "Magic-Link gesendet";
    const body = registerSent
      ? "Wir haben dir einen Bestätigungslink geschickt. Klick den Link in der Mail um den Login abzuschliessen."
      : "Schau in dein Postfach und klick den Link.";
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center space-y-3">
        <Icon className="mx-auto size-8 text-emerald-500" />
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono">{email}</span> — {body}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMagicSent(false);
            setRegisterSent(false);
          }}
          className="mt-2"
        >
          Zurück
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setLocalError(null);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === m
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "login" ? "Anmelden" : "Registrieren"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
          <Label htmlFor="password">
            Passwort
            {mode === "register" && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                mind. 8 Zeichen
              </span>
            )}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
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
              {localError ||
                "Login fehlgeschlagen, bitte erneut versuchen."}
            </span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {active === "password" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {mode === "register" ? "Account wird erstellt..." : "Einloggen..."}
            </>
          ) : mode === "register" ? (
            "Account erstellen"
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
    </div>
  );
}
