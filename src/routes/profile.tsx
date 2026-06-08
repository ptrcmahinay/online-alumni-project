import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Building2,
  Briefcase,
  Globe,
  Upload,
  Loader2,
  Save,
  Camera,
  FileText,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function ProfilePage() {
  const { user, profile, isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    student_number: profile?.student_number || "",
    course: profile?.course || "",
    batch: profile?.batch || "",
    graduation_year: profile?.graduation_year || "",
    employment_status: profile?.employment_status || "",
    company: profile?.company || "",
    position: profile?.position || "",
    industry: profile?.industry || "",
    location: profile?.location || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    github: profile?.github || "",
    twitter: profile?.twitter || "",
    linkedin: profile?.linkedin || "",
  });

  const initials = getInitials(profile?.full_name || user?.email || "U");

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        course: form.course || null,
        batch: form.batch || null,
        phone: form.phone || null,
        student_number: form.student_number || null,
        location: form.location || null,
        bio: form.bio || null,
        graduation_year: form.graduation_year || null,
        employment_status: form.employment_status || null,
        company: form.company || null,
        position: form.position || null,
        industry: form.industry || null,
        website: form.website || null,
        github: form.github || null,
        twitter: form.twitter || null,
        linkedin: form.linkedin || null,
      })
      .eq("id", user!.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/avatar.${ext}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", user!.id);
    setUploadingAvatar(false);
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/resume.${ext}`;
    await supabase.storage.from("documents").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
    await supabase.from("profiles").update({ resume_url: urlData.publicUrl }).eq("id", user!.id);
    setUploadingResume(false);
  }

  async function handleCertUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingCert(true);
    const currentCerts = (profile?.certificates as string[]) || [];
    const newUrls: string[] = [];
    for (const file of files) {
      const path = `${user!.id}/certs/${Date.now()}-${file.name}`;
      await supabase.storage.from("documents").upload(path, file, { upsert: true });
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }
    await supabase
      .from("profiles")
      .update({ certificates: [...currentCerts, ...newUrls] })
      .eq("id", user!.id);
    setUploadingCert(false);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-cvsu-dark">My Profile</h1>
          <p className="mt-1 text-sm text-cvsu-green/60">Manage your alumni profile information</p>
        </div>

        <Card className="border-cvsu-green/10 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                ) : null}
                <AvatarFallback className="bg-cvsu-dark text-2xl text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-cvsu-green text-white shadow-sm"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-cvsu-dark">
                {profile?.full_name || "Set your name"}
              </h2>
              <p className="text-sm text-cvsu-green/60">{user?.email}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                {isAdmin ? (
                  <Badge className="bg-cvsu-dark text-white">Admin</Badge>
                ) : (
                  <Badge className="bg-cvsu-green/10 text-cvsu-green">Alumni</Badge>
                )}
                {profile?.batch && (
                  <Badge className="bg-cvsu-green/10 text-cvsu-dark">Batch {profile.batch}</Badge>
                )}
                {profile?.course && (
                  <Badge className="bg-cvsu-green/10 text-cvsu-dark">{profile.course}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="w-full overflow-x-auto border-cvsu-green/10 bg-white">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                  <User className="h-4 w-4 text-cvsu-green" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    className="border-cvsu-green/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled className="border-cvsu-green/20 bg-cvsu-light" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="phone"
                      placeholder="+63 912 345 6789"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="location"
                      placeholder="City, Province"
                      value={form.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Short bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell your fellow alumni about yourself..."
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    className="border-cvsu-green/20"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                  <GraduationCap className="h-4 w-4 text-cvsu-green" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="student_number">Student number</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="student_number"
                      placeholder="e.g. 2020-12345"
                      value={form.student_number}
                      onChange={(e) => handleChange("student_number", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="course"
                      placeholder="e.g. BSIT"
                      value={form.course}
                      onChange={(e) => handleChange("course", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch year</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="batch"
                      placeholder="e.g. 2024"
                      value={form.batch}
                      onChange={(e) => handleChange("batch", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">Graduation year</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="graduation_year"
                      placeholder="e.g. 2024"
                      value={form.graduation_year}
                      onChange={(e) => handleChange("graduation_year", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment" className="space-y-6">
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                  <Briefcase className="h-4 w-4 text-cvsu-green" />
                  Current Employment
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employment_status">Employment status</Label>
                  <select
                    id="employment_status"
                    value={form.employment_status}
                    onChange={(e) => handleChange("employment_status", e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-cvsu-green/20 bg-white px-3 py-2 text-sm text-cvsu-dark outline-none focus:border-cvsu-dark"
                  >
                    <option value="">Select status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="freelance">Freelance</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="continuing-education">Continuing Education</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g. Information Technology"
                    value={form.industry}
                    onChange={(e) => handleChange("industry", e.target.value)}
                    className="border-cvsu-green/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="company"
                      placeholder="Company name"
                      value={form.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Job position</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="position"
                      placeholder="Your role"
                      value={form.position}
                      onChange={(e) => handleChange("position", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                  <Globe className="h-4 w-4 text-cvsu-green" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="website"
                      placeholder="https://yoursite.com"
                      value={form.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/..."
                      value={form.linkedin}
                      onChange={(e) => handleChange("linkedin", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="github"
                      placeholder="https://github.com/..."
                      value={form.github}
                      onChange={(e) => handleChange("github", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/..."
                      value={form.twitter}
                      onChange={(e) => handleChange("twitter", e.target.value)}
                      className="border-cvsu-green/20 pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                  <Upload className="h-4 w-4 text-cvsu-green" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-cvsu-green/20 p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-cvsu-green/40" />
                  <p className="mt-2 text-sm font-medium text-cvsu-dark">Resume / CV</p>
                  <p className="text-xs text-cvsu-green/60">PDF format, max 5MB</p>
                  {profile?.resume_url ? (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <a
                        href={profile.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-cvsu-green hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        View resume
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-red-500"
                        onClick={async () => {
                          await supabase.from("profiles").update({ resume_url: null }).eq("id", user!.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <input
                        ref={resumeInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleResumeUpload}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-cvsu-green/20"
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={uploadingResume}
                      >
                        {uploadingResume ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : null}
                        Choose file
                      </Button>
                    </>
                  )}
                </div>
                <div className="rounded-lg border-2 border-dashed border-cvsu-green/20 p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-cvsu-green/40" />
                  <p className="mt-2 text-sm font-medium text-cvsu-dark">Certificates</p>
                  <p className="text-xs text-cvsu-green/60">PDF or image, max 10MB each</p>
                  {profile?.certificates && (profile.certificates as string[]).length > 0 ? (
                    <div className="mt-3 space-y-1">
                      {(profile.certificates as string[]).map((url, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-cvsu-green hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            Certificate {idx + 1}
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-red-500"
                            onClick={async () => {
                              const updated = [...(profile.certificates as string[])];
                              updated.splice(idx, 1);
                              await supabase.from("profiles").update({ certificates: updated }).eq("id", user!.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <input
                    ref={certInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    multiple
                    className="hidden"
                    onChange={handleCertUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-cvsu-green/20"
                    onClick={() => certInputRef.current?.click()}
                    disabled={uploadingCert}
                  >
                    {uploadingCert ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    {profile?.certificates && (profile.certificates as string[]).length > 0 ? "Add more" : "Choose files"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-cvsu-green/10 bg-white px-4 py-3 shadow-sm lg:-mx-6 lg:px-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? "Saved!" : "Save changes"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
