import { useState, useRef } from "react";
import type { Profile } from "@/lib/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  MoreVertical,
  User,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Building2,
  Briefcase,
  Globe,
  Loader2,
  Save,
  X,
  Mail,
  ExternalLink,
  FileText,
  Camera,
  Trash2,
  Upload,
} from "lucide-react";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface ProfileCardProps {
  profile: Profile;
  email?: string;
  editable?: boolean;
  saving?: boolean;
  onSave?: (updates: Partial<Profile>) => Promise<void>;
  children?: React.ReactNode;
  // File upload props (only used when editable)
  onAvatarUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingAvatar?: boolean;
  onResumeUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingResume?: boolean;
  onCertUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingCert?: boolean;
  onDeleteResume?: () => void;
  onDeleteCert?: (index: number) => void;
  avatarInputRef?: React.RefObject<HTMLInputElement | null>;
  resumeInputRef?: React.RefObject<HTMLInputElement | null>;
  certInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function ProfileCard({
  profile,
  email,
  editable,
  saving,
  onSave,
  children,
  onAvatarUpload,
  uploadingAvatar,
  onResumeUpload,
  uploadingResume,
  onCertUpload,
  uploadingCert,
  onDeleteResume,
  onDeleteCert,
  avatarInputRef: externalAvatarRef,
  resumeInputRef: externalResumeRef,
  certInputRef: externalCertRef,
}: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const internalAvatarRef = useRef<HTMLInputElement>(null);
  const internalResumeRef = useRef<HTMLInputElement>(null);
  const internalCertRef = useRef<HTMLInputElement>(null);

  const aRef = externalAvatarRef || internalAvatarRef;
  const rRef = externalResumeRef || internalResumeRef;
  const cRef = externalCertRef || internalCertRef;

  const [form, setForm] = useState<Partial<Profile>>({
    full_name: profile.full_name || "",
    student_number: profile.student_number || "",
    course: profile.course || "",
    batch: profile.batch || "",
    graduation_year: profile.graduation_year || "",
    employment_status: profile.employment_status || "",
    company: profile.company || "",
    position: profile.position || "",
    industry: profile.industry || "",
    location: profile.location || "",
    phone: profile.phone || "",
    bio: profile.bio || "",
    website: profile.website || "",
    github: profile.github || "",
    twitter: profile.twitter || "",
    linkedin: profile.linkedin || "",
    avatar_url: profile.avatar_url || null,
    resume_url: profile.resume_url || null,
    certificates: profile.certificates || null,
  });

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEditing() {
    setForm({
      full_name: profile.full_name || "",
      student_number: profile.student_number || "",
      course: profile.course || "",
      batch: profile.batch || "",
      graduation_year: profile.graduation_year || "",
      employment_status: profile.employment_status || "",
      company: profile.company || "",
      position: profile.position || "",
      industry: profile.industry || "",
      location: profile.location || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
      website: profile.website || "",
      github: profile.github || "",
      twitter: profile.twitter || "",
      linkedin: profile.linkedin || "",
      avatar_url: profile.avatar_url || null,
      resume_url: profile.resume_url || null,
      certificates: profile.certificates || null,
    });
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function handleSave() {
    if (!onSave) return;
    await onSave(form);
    setEditing(false);
  }

  const initials = getInitials(profile.full_name || email || "U");

  function displayValue(value: string | null | undefined, placeholder = "—") {
    return value || placeholder;
  }

  return (
    <Card className="border-cvsu-green/10 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              ) : null}
              <AvatarFallback className="bg-cvsu-dark text-xl text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            {editing && onAvatarUpload && (
              <>
                <input
                  ref={aRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarUpload}
                />
                <button
                  onClick={() => aRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-cvsu-green text-white shadow-sm"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </button>
              </>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-cvsu-dark">
                  {displayValue(profile.full_name, "Name not set")}
                </h2>
                {email && (
                  <p className="text-sm text-cvsu-green/60">{email}</p>
                )}
              </div>
              {editable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={editing ? cancelEditing : startEditing}
                >
                  {editing ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.role === "admin" ? (
                <Badge className="bg-cvsu-dark text-white">Admin</Badge>
              ) : (
                <Badge className="bg-cvsu-green/10 text-cvsu-green">Alumni</Badge>
              )}
              {profile.batch && (
                <Badge className="bg-cvsu-green/10 text-cvsu-dark">Batch {profile.batch}</Badge>
              )}
              {profile.course && (
                <Badge className="bg-cvsu-green/10 text-cvsu-dark">{profile.course}</Badge>
              )}
              {editing && (
                <Badge className="bg-amber-100 text-amber-700">Editing</Badge>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-5 bg-cvsu-green/10" />

        {/* Contact */}
        <Section icon={<Mail className="h-3.5 w-3.5 text-cvsu-green" />} title="Contact">
          <FieldRow>
            {editing ? (
              <>
                <FieldItem label="Email" value={email || ""} icon={<Mail className="h-3.5 w-3.5 text-cvsu-green/40" />} disabled />
                <FieldItem
                  label="Phone"
                  value={form.phone || ""}
                  icon={<Phone className="h-3.5 w-3.5 text-cvsu-green/40" />}
                  onChange={(v) => handleChange("phone", v)}
                />
              </>
            ) : (
              <>
                <FieldItem label="Email" value={email || "—"} icon={<Mail className="h-3.5 w-3.5 text-cvsu-green/40" />} />
                <FieldItem label="Phone" value={displayValue(profile.phone)} icon={<Phone className="h-3.5 w-3.5 text-cvsu-green/40" />} />
              </>
            )}
          </FieldRow>
          {editing ? (
            <FieldItem
              label="Location"
              value={form.location || ""}
              icon={<MapPin className="h-3.5 w-3.5 text-cvsu-green/40" />}
              onChange={(v) => handleChange("location", v)}
            />
          ) : (
            <FieldItem label="Location" value={displayValue(profile.location)} icon={<MapPin className="h-3.5 w-3.5 text-cvsu-green/40" />} />
          )}
        </Section>

        <Separator className="my-5 bg-cvsu-green/10" />

        {/* Education */}
        <Section icon={<GraduationCap className="h-3.5 w-3.5 text-cvsu-green" />} title="Education">
          <FieldRow>
            {editing ? (
              <>
                <FieldItem label="Student #" value={form.student_number || ""} icon={<BookOpen className="h-3.5 w-3.5 text-cvsu-green/40" />} onChange={(v) => handleChange("student_number", v)} />
                <FieldItem label="Course" value={form.course || ""} icon={<BookOpen className="h-3.5 w-3.5 text-cvsu-green/40" />} onChange={(v) => handleChange("course", v)} />
              </>
            ) : (
              <>
                <FieldItem label="Student #" value={displayValue(profile.student_number)} icon={<BookOpen className="h-3.5 w-3.5 text-cvsu-green/40" />} />
                <FieldItem label="Course" value={displayValue(profile.course)} icon={<BookOpen className="h-3.5 w-3.5 text-cvsu-green/40" />} />
              </>
            )}
          </FieldRow>
          <FieldRow>
            {editing ? (
              <>
                <FieldItem label="Batch" value={form.batch || ""} icon={<Calendar className="h-3.5 w-3.5 text-cvsu-green/40" />} onChange={(v) => handleChange("batch", v)} />
                <FieldItem label="Grad year" value={form.graduation_year || ""} icon={<GraduationCap className="h-3.5 w-3.5 text-cvsu-green/40" />} onChange={(v) => handleChange("graduation_year", v)} />
              </>
            ) : (
              <>
                <FieldItem label="Batch" value={displayValue(profile.batch)} icon={<Calendar className="h-3.5 w-3.5 text-cvsu-green/40" />} />
                <FieldItem label="Grad year" value={displayValue(profile.graduation_year)} icon={<GraduationCap className="h-3.5 w-3.5 text-cvsu-green/40" />} />
              </>
            )}
          </FieldRow>
        </Section>

        <Separator className="my-5 bg-cvsu-green/10" />

        {/* Employment */}
        <Section icon={<Briefcase className="h-3.5 w-3.5 text-cvsu-green" />} title="Employment">
          <FieldRow>
            {editing ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-cvsu-green/60">Status</Label>
                  <select
                    value={form.employment_status || ""}
                    onChange={(e) => handleChange("employment_status", e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-cvsu-green/20 bg-white px-3 py-1.5 text-sm text-cvsu-dark outline-none focus:border-cvsu-dark"
                  >
                    <option value="">Select status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="freelance">Freelance</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="continuing-education">Continuing Education</option>
                  </select>
                </div>
                <FieldItem label="Industry" value={form.industry || ""} onChange={(v) => handleChange("industry", v)} />
              </>
            ) : (
              <>
                <FieldItem
                  label="Status"
                  value={profile.employment_status ? profile.employment_status.replace("-", " ") : "—"}
                  badge={
                    profile.employment_status
                      ? profile.employment_status === "employed"
                        ? "bg-cvsu-green/10 text-cvsu-green"
                        : profile.employment_status === "freelance"
                          ? "bg-amber-100 text-amber-700"
                          : profile.employment_status === "self-employed"
                            ? "bg-purple-100 text-purple-700"
                            : profile.employment_status === "unemployed"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-blue-100 text-blue-700"
                      : undefined
                  }
                />
                <FieldItem label="Industry" value={displayValue(profile.industry)} />
              </>
            )}
          </FieldRow>
          <FieldRow>
            {editing ? (
              <>
                <FieldItem label="Company" value={form.company || ""} icon={<Building2 className="h-3.5 w-3.5 text-cvsu-green/40" />} onChange={(v) => handleChange("company", v)} />
                <FieldItem label="Position" value={form.position || ""} icon={<Briefcase className="h-3.5 w-3.5 text-cvsu-green/40" />} onChange={(v) => handleChange("position", v)} />
              </>
            ) : (
              <>
                <FieldItem label="Company" value={displayValue(profile.company)} icon={<Building2 className="h-3.5 w-3.5 text-cvsu-green/40" />} />
                <FieldItem label="Position" value={displayValue(profile.position)} icon={<Briefcase className="h-3.5 w-3.5 text-cvsu-green/40" />} />
              </>
            )}
          </FieldRow>
        </Section>

        <Separator className="my-5 bg-cvsu-green/10" />

        {/* Social Links */}
        <Section icon={<Globe className="h-3.5 w-3.5 text-cvsu-green" />} title="Social Links">
          <FieldRow>
            {editing ? (
              <>
                <FieldItem label="Website" value={form.website || ""} onChange={(v) => handleChange("website", v)} />
                <FieldItem label="LinkedIn" value={form.linkedin || ""} onChange={(v) => handleChange("linkedin", v)} />
              </>
            ) : (
              <>
                <SocialLink label="Website" url={profile.website} />
                <SocialLink label="LinkedIn" url={profile.linkedin} />
              </>
            )}
          </FieldRow>
          <FieldRow>
            {editing ? (
              <>
                <FieldItem label="GitHub" value={form.github || ""} onChange={(v) => handleChange("github", v)} />
                <FieldItem label="Twitter / X" value={form.twitter || ""} onChange={(v) => handleChange("twitter", v)} />
              </>
            ) : (
              <>
                <SocialLink label="GitHub" url={profile.github} />
                <SocialLink label="Twitter / X" url={profile.twitter} />
              </>
            )}
          </FieldRow>
        </Section>

        <Separator className="my-5 bg-cvsu-green/10" />

        {/* Bio */}
        <Section icon={<User className="h-3.5 w-3.5 text-cvsu-green" />} title="Bio">
          {editing ? (
            <Textarea
              value={form.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="border-cvsu-green/20"
              rows={3}
              placeholder="Tell your fellow alumni about yourself..."
            />
          ) : (
            <p className="text-sm text-cvsu-dark leading-relaxed">
              {profile.bio || "No bio yet."}
            </p>
          )}
        </Section>

        {/* Documents */}
        {(profile.resume_url || profile.certificates?.length || editing) && (
          <>
            <Separator className="my-5 bg-cvsu-green/10" />
            <Section icon={<Upload className="h-3.5 w-3.5 text-cvsu-green" />} title="Documents">
              <div className="space-y-3">
                {/* Resume */}
                <div className="flex items-center justify-between rounded-lg border border-cvsu-green/10 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-cvsu-green" />
                    <span className="font-medium text-cvsu-dark">Resume / CV</span>
                  </div>
                  {profile.resume_url ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={profile.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-cvsu-green hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </a>
                      {editing && onDeleteResume && (
                        <button onClick={onDeleteResume} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ) : editing ? (
                    <span className="text-xs text-cvsu-green/40">Not uploaded</span>
                  ) : null}
                  {editing && onResumeUpload && (
                    <>
                      <input ref={rRef} type="file" accept=".pdf" className="hidden" onChange={onResumeUpload} />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 border-cvsu-green/20 text-xs"
                        onClick={() => rRef.current?.click()}
                        disabled={uploadingResume}
                      >
                        {uploadingResume ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                        {profile.resume_url ? "Replace" : "Upload"}
                      </Button>
                    </>
                  )}
                </div>

                {/* Certificates */}
                <div className="rounded-lg border border-cvsu-green/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-cvsu-green" />
                      <span className="font-medium text-cvsu-dark">Certificates ({(profile.certificates as string[])?.length || 0})</span>
                    </div>
                    {editing && onCertUpload && (
                      <>
                        <input ref={cRef} type="file" accept=".pdf,image/*" multiple className="hidden" onChange={onCertUpload} />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 border-cvsu-green/20 text-xs"
                          onClick={() => cRef.current?.click()}
                          disabled={uploadingCert}
                        >
                          {uploadingCert ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                          Add
                        </Button>
                      </>
                    )}
                  </div>
                  {(profile.certificates as string[])?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(profile.certificates as string[]).map((url, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 rounded-md bg-cvsu-green/5 px-2 py-1">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-cvsu-green hover:underline"
                          >
                            <FileText className="h-3 w-3" />
                            Certificate {idx + 1}
                          </a>
                          {editing && onDeleteCert && (
                            <button onClick={() => onDeleteCert(idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Section>
          </>
        )}

        {/* Edit mode: Save/Cancel */}
        {editing && (
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={cancelEditing}
              className="border-cvsu-green/20"
            >
              Cancel
            </Button>
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
              Save changes
            </Button>
          </div>
        )}

        {/* Admin actions slot */}
        {children && !editing && (
          <>
            <Separator className="my-5 bg-cvsu-green/10" />
            {children}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Helper sub-components

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-sm font-medium text-cvsu-dark">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">{children}</div>
  );
}

function FieldItem({
  label,
  value,
  icon,
  onChange,
  disabled,
  badge,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-cvsu-green/60">{label}</Label>
      {onChange ? (
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
          )}
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`border-cvsu-green/20 ${icon ? "pl-9" : ""}`}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-sm text-cvsu-dark">
          {icon && <span className="shrink-0">{icon}</span>}
          {badge ? (
            <Badge className={badge}>{value}</Badge>
          ) : (
            <span className="truncate">{value}</span>
          )}
        </div>
      )}
    </div>
  );
}

function SocialLink({ label, url }: { label: string; url: string | null }) {
  if (!url) return null;
  return (
    <div className="space-y-1">
      <Label className="text-xs text-cvsu-green/60">{label}</Label>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 rounded-lg border border-cvsu-green/10 px-3 py-1.5 text-xs text-cvsu-green hover:bg-cvsu-light w-fit"
      >
        <ExternalLink className="h-3 w-3" />
        {url.replace(/^https?:\/\//, "").replace(/\/.*/, "").slice(0, 25)}
      </a>
    </div>
  );
}
