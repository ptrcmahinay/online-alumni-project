import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Career } from "@/lib/database.types";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Briefcase,
  Plus,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/employment")({
  component: EmploymentPage,
});

function EmploymentPage() {
  const { user, profile } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(profile?.employment_status || "employed");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newJob, setNewJob] = useState({ company: "", position: "", start_date: "", end_date: "", is_current: false });

  useEffect(() => {
    if (!user) return;
    fetchCareers();
  }, [user]);

  async function fetchCareers() {
    const { data } = await supabase
      .from("careers")
      .select("*")
      .eq("user_id", user!.id)
      .order("start_date", { ascending: false });
    if (data) setCareers(data);
    setLoading(false);
  }

  const stats = [
    {
      label: "Employment Rate",
      value:
        profile?.employment_status && profile.employment_status !== "unemployed"
          ? "Employed"
          : "Not specified",
    },
    { label: "Positions Held", value: String(careers.length) },
    {
      label: "Current",
      value:
        careers.filter((c) => c.is_current).length > 0
          ? careers.filter((c) => c.is_current)[0]?.position || "None"
          : "None specified",
    },
    {
      label: "Companies",
      value: String(new Set(careers.map((c) => c.company)).size),
    },
  ];

  function handleStatusChange(value: string) {
    setStatus(value);
    if (profile?.id) {
      supabase
        .from("profiles")
        .update({ employment_status: value })
        .eq("id", profile.id)
        .then();
    }
  }

  async function handleAddJob() {
    if (!newJob.company || !newJob.position || !newJob.start_date) return;
    setAdding(true);
    const { data } = await supabase
      .from("careers")
      .insert({
        user_id: user!.id,
        company: newJob.company,
        position: newJob.position,
        start_date: newJob.start_date,
        end_date: newJob.is_current ? null : newJob.end_date || null,
        is_current: newJob.is_current,
      })
      .select()
      .single();
    if (data) {
      setCareers((prev) => [data, ...prev]);
      setNewJob({ company: "", position: "", start_date: "", end_date: "", is_current: false });
      setDialogOpen(false);
    }
    setAdding(false);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-cvsu-dark">Employment Tracking</h1>
            <p className="mt-1 text-sm text-cvsu-green/60">Manage your employment history and status</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green">
                <Plus className="h-4 w-4" />
                Add employment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Employment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-company">Company</Label>
                  <Input
                    id="job-company"
                    value={newJob.company}
                    onChange={(e) => setNewJob((p) => ({ ...p, company: e.target.value }))}
                    className="border-cvsu-green/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-position">Position</Label>
                  <Input
                    id="job-position"
                    value={newJob.position}
                    onChange={(e) => setNewJob((p) => ({ ...p, position: e.target.value }))}
                    className="border-cvsu-green/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-start">Start date</Label>
                  <Input
                    id="job-start"
                    type="date"
                    value={newJob.start_date}
                    onChange={(e) => setNewJob((p) => ({ ...p, start_date: e.target.value }))}
                    className="border-cvsu-green/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="job-current"
                    type="checkbox"
                    checked={newJob.is_current}
                    onChange={(e) => setNewJob((p) => ({ ...p, is_current: e.target.checked, end_date: e.target.checked ? "" : p.end_date }))}
                    className="h-4 w-4 rounded border-cvsu-green/20 text-cvsu-dark"
                  />
                  <Label htmlFor="job-current" className="text-sm">I currently work here</Label>
                </div>
                {!newJob.is_current && (
                  <div className="space-y-2">
                    <Label htmlFor="job-end">End date</Label>
                    <Input
                      id="job-end"
                      type="date"
                      value={newJob.end_date}
                      onChange={(e) => setNewJob((p) => ({ ...p, end_date: e.target.value }))}
                      className="border-cvsu-green/20"
                    />
                  </div>
                )}
                <Button
                  onClick={handleAddJob}
                  disabled={adding || !newJob.company || !newJob.position || !newJob.start_date}
                  className="w-full bg-cvsu-dark text-white hover:bg-cvsu-green"
                >
                  {adding ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-cvsu-green/10 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold text-cvsu-dark">{s.value}</div>
                <div className="text-xs text-cvsu-green/60">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Employment Status */}
          <Card className="border-cvsu-green/10 shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                <Briefcase className="h-4 w-4 text-cvsu-green" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { value: "employed", label: "Employed", icon: Briefcase },
                { value: "self-employed", label: "Self-Employed", icon: Briefcase },
                { value: "freelance", label: "Freelance", icon: Briefcase },
                { value: "unemployed", label: "Unemployed", icon: Briefcase },
                { value: "continuing-education", label: "Continuing Education", icon: BookOpen },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    status === opt.value
                      ? "border-cvsu-dark bg-cvsu-dark/5 text-cvsu-dark"
                      : "border-cvsu-green/10 text-cvsu-green/70 hover:border-cvsu-green/30"
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      status === opt.value ? "bg-cvsu-dark" : "bg-cvsu-green/30"
                    }`}
                  />
                  {opt.label}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Employment Timeline */}
          <Card className="border-cvsu-green/10 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                <Clock className="h-4 w-4 text-cvsu-green" />
                Employment History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {loading ? (
                <p className="text-sm text-cvsu-green/60">Loading...</p>
              ) : careers.length === 0 ? (
                <p className="text-sm text-cvsu-green/60">No employment history yet.</p>
              ) : (
                careers.map((job, index) => (
                  <div key={job.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {index < careers.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-cvsu-green/20" />
                    )}
                    {/* Timeline dot */}
                    <div className="relative z-10 mt-1">
                      {job.is_current ? (
                        <CheckCircle2 className="h-5 w-5 text-cvsu-green" />
                      ) : (
                        <Circle className="h-5 w-5 text-cvsu-green/40" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1 rounded-lg border border-cvsu-green/10 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-cvsu-dark">{job.position}</h3>
                          <div className="flex items-center gap-2 text-sm text-cvsu-green/60">
                            <Building2 className="h-3.5 w-3.5" />
                            {job.company}
                          </div>
                        </div>
                        {job.is_current && (
                          <Badge className="bg-cvsu-green/20 text-xs text-cvsu-dark">Current</Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-cvsu-green/50">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {job.start_date
                            ? new Date(job.start_date).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}{" "}
                          —{" "}
                          {job.is_current
                            ? "Present"
                            : job.end_date
                              ? new Date(job.end_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function BookOpen(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  );
}
