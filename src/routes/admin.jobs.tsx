import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Building2, MapPin, Clock, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/jobs")({
  component: AdminJobsPage,
});

function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadData() {
    const [jobsRes, profilesRes] = await Promise.all([
      supabase.from("opportunities").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name"),
    ]);
    if (jobsRes.data) setJobs(jobsRes.data);
    if (profilesRes.data) {
      const map: Record<string, string> = {};
      for (const p of profilesRes.data) map[p.id] = p.full_name || "Unknown";
      setProfiles(map);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleAction(id: string, status: string) {
    setActionLoading(true);
    await supabase.from("opportunities").update({ status }).eq("id", id);
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status } : j));
    if (selectedJob?.id === id) setSelectedJob((prev: any) => prev ? { ...prev, status } : prev);
    setActionLoading(false);
    setReviewOpen(false);
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-cvsu-dark">Job Posts Management</h1>
        <p className="mt-1 text-sm text-cvsu-green/60">Approve, reject, and monitor job referrals</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-cvsu-green/60">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-cvsu-green/60">No job posts.</p>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="border-cvsu-green/10 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cvsu-dark/10 text-cvsu-dark">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-cvsu-dark">{job.title}</h3>
                      <Badge
                        variant="secondary"
                        className={
                          job.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : job.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-cvsu-green/60">{job.company}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-cvsu-green/50">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}{job.hybrid ? " (Hybrid)" : ""}</span>
                      {job.salary_range && <span className="flex items-center gap-1">{job.salary_range}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(job.created_at).toLocaleDateString()}</span>
                      {job.email && <span>contact: {job.email}</span>}
                      <span>by {profiles[job.posted_by] || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                {job.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-cvsu-dark text-white hover:bg-cvsu-green"
                      onClick={() => { setSelectedJob(job); setReviewOpen(true); }}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Review
                    </Button>
                  </div>
                )}
                {job.status !== "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    {job.status === "approved" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Review job post</DialogTitle>
            <DialogDescription>Approve or reject this job referral</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-cvsu-dark">{selectedJob.title}</h3>
                <p className="text-sm text-cvsu-green/60">{selectedJob.company}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-cvsu-green/60">Location:</span> <span className="text-cvsu-dark">{selectedJob.location}{selectedJob.hybrid ? " (Hybrid)" : ""}</span></div>
                <div><span className="text-cvsu-green/60">Type:</span> <span className="text-cvsu-dark">{selectedJob.type}</span></div>
                {selectedJob.salary_range && <div><span className="text-cvsu-green/60">Salary:</span> <span className="text-cvsu-dark">{selectedJob.salary_range}</span></div>}
                {selectedJob.email && <div><span className="text-cvsu-green/60">Contact:</span> <span className="text-cvsu-dark">{selectedJob.email}</span></div>}
                <div><span className="text-cvsu-green/60">Posted by:</span> <span className="text-cvsu-dark">{profiles[selectedJob.posted_by] || "Unknown"}</span></div>
                <div><span className="text-cvsu-green/60">Date:</span> <span className="text-cvsu-dark">{new Date(selectedJob.created_at).toLocaleDateString()}</span></div>
              </div>
              {selectedJob.description && (
                <div>
                  <div className="text-xs text-cvsu-green/60 uppercase tracking-wider mb-1">Description</div>
                  <p className="text-sm text-cvsu-dark whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
              )}
              {selectedJob.requirements && (
                <div>
                  <div className="text-xs text-cvsu-green/60 uppercase tracking-wider mb-1">Requirements</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.requirements.split("\n").filter(Boolean).map((req: string) => (
                      <Badge key={req} variant="outline" className="border-cvsu-green/10 text-xs text-cvsu-green/60">{req}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={actionLoading} onClick={() => handleAction(selectedJob?.id, "rejected")} className="border-red-200 text-red-600">
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
            <Button disabled={actionLoading} onClick={() => handleAction(selectedJob?.id, "approved")} className="bg-cvsu-dark text-white hover:bg-cvsu-green">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              {actionLoading ? "Processing..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
