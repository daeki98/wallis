"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

type Mode = "login" | "register";

export function LoginForm({ error }: { error?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [identifier, setIdentifier] = useState(""); // E-Mail oder Name (Login) | E-Mail (Register)
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    startTransition(async () => {
      const supabase = createClient();

      if (mode === "register") {
        if (!identifier.includes("@")) {
          setLocalError("Bei der Registrierung brauchen wir deine E-Mail.");
          return;
        }
        if (!name.trim()) {
          setLocalError("Bitte gib deinen Namen ein.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: identifier,
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) {
          setLocalError(error.message);
          return;
        }
        router.replace("/");
        router.refresh();
        return;
      }

      // Login: erlaubt E-Mail ODER Name
      let loginEmail = identifier;
      if (!identifier.includes("@")) {
        const { data, error } = await supabase.rpc("email_for_login", {
          _input: identifier,
        });
        if (error || !data) {
          setLocalError("Kein Account mit diesem Namen gefunden.");
          return;
        }
        loginEmail = data;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (signInError) {
        setLocalError(
          signInError.message.toLowerCase().includes("invalid")
            ? "Falsches Passwort."
            : signInError.message,
        );
        return;
      }
      router.replace("/");
      router.refresh();
    });
  };

  const idLabel =
    mode === "login" ? "E-Mail oder Name" : "E-Mail";
  const idPlaceholder =
    mode === "login" ? "du@example.com oder Pascal" : "du@example.com";

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
          <Label htmlFor="identifier">{idLabel}</Label>
          <Input
            id="identifier"
            type={mode === "register" ? "email" : "text"}
            autoComplete={mode === "register" ? "email" : "username"}
            placeholder={idPlaceholder}
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={isPending}
            autoFocus
          />
        </div>

        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Pascal"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Passwort</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              required
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
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : mode === "register" ? (
            "Account erstellen"
          ) : (
            "Einloggen"
          )}
        </Button>
      </form>
    </div>
  );
}
