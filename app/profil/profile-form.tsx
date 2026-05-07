"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, LogOut, Shuffle, Trash2 } from "lucide-react";
import { rerollAvatar, setAvatar, signOut, updateProfile } from "@/app/actions";
import { toast } from "sonner";

export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [savingName, startSavingName] = useTransition();
  const [removing, startRemoving] = useTransition();
  const [rerolling, startRerolling] = useTransition();

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Datei zu gross (max 5 MB)");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      // Best-effort cleanup of old avatar in same folder
      if (avatarUrl && avatarUrl !== path) {
        await supabase.storage.from("avatars").remove([avatarUrl]);
      }

      const result = await setAvatar(path);
      if (result.error) throw new Error(result.error);

      setAvatarUrl(path);
      toast.success("Profilbild aktualisiert");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onReroll = () => {
    startRerolling(async () => {
      const result = await rerollAvatar();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.avatar) setAvatarUrl(result.avatar);
      toast.success("Neue Katze eingezogen 🐱");
      router.refresh();
    });
  };

  const onRemove = () => {
    if (!avatarUrl) return;
    startRemoving(async () => {
      const supabase = createClient();
      await supabase.storage.from("avatars").remove([avatarUrl]);
      const result = await setAvatar(null);
      if (result.error) toast.error(result.error);
      else {
        setAvatarUrl(null);
        toast.success("Profilbild entfernt");
        router.refresh();
      }
    });
  };

  const onSaveName = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startSavingName(async () => {
      const result = await updateProfile(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Name gespeichert");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5">
        <Avatar
          name={profile.display_name}
          src={avatarUrl}
          size={80}
        />
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
              {avatarUrl ? "Bild ändern" : "Bild hochladen"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReroll}
              disabled={rerolling}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              {rerolling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Shuffle className="size-4" />
              )}
              Andere Katze
            </Button>
            {avatarUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={removing}
                className="gap-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Entfernen
              </Button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={onSaveName} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display_name">Username</Label>
          <Input
            id="display_name"
            name="display_name"
            required
            defaultValue={profile.display_name}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">E-Mail</Label>
          <Input value={email} disabled />
        </div>
        <Button type="submit" disabled={savingName}>
          {savingName && <Loader2 className="size-4 animate-spin" />}
          Speichern
        </Button>
      </form>

      <div className="border-t border-border pt-6">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" />
            Abmelden
          </Button>
        </form>
      </div>
    </div>
  );
}
