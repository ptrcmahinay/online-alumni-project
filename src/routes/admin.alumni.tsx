import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import type { Profile, Career } from "@/lib/database.types";
import { ProfileCard } from "@/components/profile-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Briefcase,
  Building2,
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Alumni Profile</DialogTitle>
          </DialogHeader>
          {selected && (
            <ProfileCard profile={selected}>
              {/* Careers section */}
              {selected.careers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-1.5 text-sm font-medium text-cvsu-dark">
                    <Briefcase className="h-3.5 w-3.5 text-cvsu-green" />
                    Work History
                  </h3>
                  <div className="space-y-2">
                    {selected.careers.map((c) => (
                      <div key={c.id} className="rounded-lg border border-cvsu-green/10 p-3">
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
                </div>
              )}

              {/* Verify/Reject */}
              {selected.verification_status !== "verified" && (
                <div className="flex items-center justify-between rounded-lg border border-cvsu-green/10 bg-cvsu-light p-4">
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
            </ProfileCard>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
