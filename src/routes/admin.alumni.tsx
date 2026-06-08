import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import type { Profile, Career } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  FileText,
  MapPin,
  Phone,
  Calendar,
  BookOpen,
  Globe,
  Building2,
  Upload,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/admin/alumni")({
  component: AdminAlumniPage,
});

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

type AlumniWithCareers = Profile & { careers: Career[] };

function AdminAlumniPage() {
  const [alumniList, setAlumniList] = useState<AlumniWithCareers[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AlumniWithCareers | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function handleVerify(id: string, status: string) {
    setVerifying(true);
    await supabase.from("profiles").update({ verification_status: status }).eq("id", id);
    setAlumniList((prev) => prev.map((a) => a.id === id ? { ...a, verification_status: status } : a));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, verification_status: status } : prev);
    setVerifying(false);
  }

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("careers").select("*").order("start_date", { ascending: false, nullsFirst: false }),
    ]).then(([profilesResult, careersResult]) => {
      const careersByUser: Record<string, Career[]> = {};
      for (const c of careersResult.data ?? []) {
        if (!careersByUser[c.user_id]) careersByUser[c.user_id] = [];
        careersByUser[c.user_id].push(c);
      }
      const merged: AlumniWithCareers[] = (profilesResult.data ?? []).map((p) => ({
        ...p,
        careers: careersByUser[p.id] ?? [],
      }));
      setAlumniList(merged);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return alumniList.filter((a) =>
      !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.course?.toLowerCase().includes(search.toLowerCase()) ||
      a.batch?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, alumniList]);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-cvsu-dark">Alumni Management</h1>
        <p className="mt-1 text-sm text-cvsu-green/60">
          View and manage all registered alumni
        </p>
      </div>

      <Card className="border-cvsu-green/10 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base text-cvsu-dark">
              All Alumni ({filtered.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
              <Input
                placeholder="Search by name, course, batch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-56 border-cvsu-green/20 pl-8 text-sm lg:w-72"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-cvsu-green/60">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumni</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          {a.avatar_url ? (
                            <AvatarImage src={a.avatar_url} alt={a.full_name ?? ""} />
                          ) : null}
                          <AvatarFallback className="bg-cvsu-dark/10 text-xs text-cvsu-dark">
                            {getInitials(a.full_name ?? "")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium text-cvsu-dark">{a.full_name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-cvsu-green/60">{a.course ?? "—"}</TableCell>
                    <TableCell className="text-sm text-cvsu-green/60">{a.batch ?? "—"}</TableCell>
                    <TableCell>
                      {a.verification_status === "verified" ? (
                        <Badge className="bg-green-100 text-green-700">Verified</Badge>
                      ) : a.verification_status === "rejected" ? (
                        <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {a.employment_status ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          {a.employment_status}
                        </Badge>
                      ) : (
                        <span className="text-sm text-cvsu-green/40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-cvsu-green/60">{a.location ?? "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => { setSelected(a); setViewOpen(true); }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {selected?.avatar_url ? (
                  <AvatarImage src={selected.avatar_url} alt={selected.full_name ?? ""} />
                ) : null}
                <AvatarFallback className="bg-cvsu-dark text-white text-sm">
                  {getInitials(selected?.full_name ?? "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg">{selected?.full_name}</div>
                <div className="text-sm font-normal text-cvsu-green/60">
                  {selected?.course ? `${selected.course} · Batch ${selected.batch ?? "—"}` : selected?.batch ? `Batch ${selected.batch}` : "—"}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <>
            <Tabs defaultValue="personal" className="mt-2">
              <TabsList className="border-cvsu-green/10 bg-cvsu-light w-full justify-start">
                <TabsTrigger value="personal" className="gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="education" className="gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="work" className="gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  Work ({selected.careers.length})
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider">Full name</div>
                    <div className="text-cvsu-dark font-medium">{selected.full_name ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider">Phone</div>
                    <div className="flex items-center gap-1.5 text-cvsu-dark">
                      <Phone className="h-3 w-3 text-cvsu-green/40" />
                      {selected.phone ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider">Location</div>
                    <div className="flex items-center gap-1.5 text-cvsu-dark">
                      <MapPin className="h-3 w-3 text-cvsu-green/40" />
                      {selected.location ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider">Employment status</div>
                    <div>
                      {selected.employment_status ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          {selected.employment_status}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider">Industry</div>
                    <div className="text-cvsu-dark">{selected.industry ?? "—"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider">Bio</div>
                    <div className="text-cvsu-dark">{selected.bio || "—"}</div>
                  </div>
                </div>

                {(selected.website || selected.linkedin || selected.github || selected.twitter) && (
                  <div>
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider mb-2">Social Links</div>
                    <div className="flex flex-wrap gap-2">
                      {selected.website && (
                        <a href={selected.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-cvsu-green/10 px-3 py-1.5 text-xs text-cvsu-green hover:bg-cvsu-light">
                          <Globe className="h-3 w-3" /> Website
                        </a>
                      )}
                      {selected.linkedin && (
                        <a href={selected.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-cvsu-green/10 px-3 py-1.5 text-xs text-cvsu-green hover:bg-cvsu-light">
                          <ExternalLink className="h-3 w-3" /> LinkedIn
                        </a>
                      )}
                      {selected.github && (
                        <a href={selected.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-cvsu-green/10 px-3 py-1.5 text-xs text-cvsu-green hover:bg-cvsu-light">
                          <ExternalLink className="h-3 w-3" /> GitHub
                        </a>
                      )}
                      {selected.twitter && (
                        <a href={selected.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-cvsu-green/10 px-3 py-1.5 text-xs text-cvsu-green hover:bg-cvsu-light">
                          <ExternalLink className="h-3 w-3" /> Twitter / X
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="education" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider">Student number</div>
                    <div className="flex items-center gap-1.5 text-cvsu-dark">
                      <BookOpen className="h-3 w-3 text-cvsu-green/40" />
                      {selected.student_number ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider">Course</div>
                    <div className="text-cvsu-dark font-medium">{selected.course ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider">Batch</div>
                    <div className="flex items-center gap-1.5 text-cvsu-dark">
                      <Calendar className="h-3 w-3 text-cvsu-green/40" />
                      {selected.batch ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-cvsu-green/60 uppercase tracking-wider">Graduation year</div>
                    <div className="flex items-center gap-1.5 text-cvsu-dark">
                      <GraduationCap className="h-3 w-3 text-cvsu-green/40" />
                      {selected.graduation_year ?? "—"}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="work" className="space-y-4 pt-4">
                {selected.careers.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-cvsu-green/40">
                    <Briefcase className="h-8 w-8" />
                    <p className="text-sm">No work experience recorded</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selected.careers.map((c) => (
                      <div key={c.id} className="rounded-lg border border-cvsu-green/10 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-cvsu-green" />
                              <span className="font-medium text-cvsu-dark">{c.company}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-cvsu-green/70">
                              <Briefcase className="h-3 w-3" />
                              {c.position}
                            </div>
                          </div>
                          {c.is_current && (
                            <Badge className="bg-cvsu-dark text-white text-[10px]">Current</Badge>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-cvsu-green/50">
                          <span>
                            {c.start_date ?? "—"}
                            {c.end_date ? ` — ${c.end_date}` : c.is_current ? " — Present" : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-cvsu-green/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-cvsu-dark mb-2">
                      <Upload className="h-4 w-4 text-cvsu-green" />
                      Resume / CV
                    </div>
                    {selected.resume_url ? (
                      <a
                        href={selected.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-cvsu-green hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        View resume
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-sm text-cvsu-green/40">No resume uploaded</p>
                    )}
                  </div>
                  <div className="rounded-lg border border-cvsu-green/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-cvsu-dark mb-2">
                      <Upload className="h-4 w-4 text-cvsu-green" />
                      Certificates ({selected.certificates?.length ?? 0})
                    </div>
                    {selected.certificates && selected.certificates.length > 0 ? (
                      <div className="space-y-1">
                        {selected.certificates.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-cvsu-green hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Certificate {idx + 1}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-cvsu-green/40">No certificates uploaded</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

              {selected.verification_status !== "verified" && (
                <div className="mt-6 flex items-center justify-between rounded-lg border border-cvsu-green/10 bg-cvsu-light p-4">
                  <div className="text-sm text-cvsu-green/70">
                    {selected.verification_status === "rejected" ? "Alumni was rejected" : "Pending verification"}
                  </div>
                  <div className="flex gap-2">
                    {selected.verification_status !== "rejected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={verifying}
                        onClick={() => handleVerify(selected.id, "rejected")}
                        className="border-red-200 text-red-600"
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    )}
                    <Button
                      size="sm"
                      disabled={verifying}
                      onClick={() => handleVerify(selected.id, "verified")}
                      className="bg-cvsu-dark text-white hover:bg-cvsu-green"
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Verify
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          </DialogContent>
      </Dialog>
    </div>
  );
}
