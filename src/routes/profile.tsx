import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/app-layout";
import { ProfileCard } from "@/components/profile-card";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  async function handleSave(updates: Record<string, any>) {
    await supabase.from("profiles").update(updates).eq("id", user!.id);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", user.id);
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/resume.${ext}`;
    await supabase.storage.from("documents").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
    await supabase.from("profiles").update({ resume_url: urlData.publicUrl }).eq("id", user.id);
  }

  async function handleCertUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length || !user || !profile) return;
    const currentCerts = (profile.certificates as string[]) || [];
    const newUrls: string[] = [];
    for (const file of files) {
      const path = `${user.id}/certs/${Date.now()}-${file.name}`;
      await supabase.storage.from("documents").upload(path, file, { upsert: true });
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }
    await supabase
      .from("profiles")
      .update({ certificates: [...currentCerts, ...newUrls] })
      .eq("id", user!.id);
  }

  async function handleDeleteResume() {
    if (!user) return;
    await supabase.from("profiles").update({ resume_url: null }).eq("id", user.id);
  }

  async function handleDeleteCert(index: number) {
    if (!user || !profile) return;
    const updated = [...((profile.certificates as string[]) || [])];
    updated.splice(index, 1);
    await supabase.from("profiles").update({ certificates: updated }).eq("id", user.id);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-cvsu-dark">My Profile</h1>
          <p className="mt-1 text-sm text-cvsu-green/60">Manage your alumni profile information</p>
        </div>

        {profile && (
          <ProfileCard
            profile={profile}
            email={user?.email}
            editable
            onSave={handleSave}
            onAvatarUpload={handleAvatarUpload}
            onResumeUpload={handleResumeUpload}
            onCertUpload={handleCertUpload}
            onDeleteResume={handleDeleteResume}
            onDeleteCert={handleDeleteCert}
            avatarInputRef={avatarInputRef}
            resumeInputRef={resumeInputRef}
            certInputRef={certInputRef}
          />
        )}
      </div>
    </AppLayout>
  );
}
