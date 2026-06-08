import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Opportunity } from "@/lib/database.types";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Search,
  Plus,
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  Loader2,
  DollarSign,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
});

const types = ["All", "Full-time", "Part-time", "Freelance", "Remote"];

function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Opportunity[]>([]);
  const [myPosts, setMyPosts] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [postOpen, setPostOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"browse" | "myposts">("browse");

  const [formTitle, setFormTitle] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formType, setFormType] = useState("Full-time");
  const [formSalary, setFormSalary] = useState("");
  const [formHybrid, setFormHybrid] = useState(false);
  const [formDesc, setFormDesc] = useState("");
  const [formReqs, setFormReqs] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formApplyLink, setFormApplyLink] = useState("");

  function resetForm() {
    setFormTitle("");
    setFormCompany("");
    setFormLocation("");
    setFormType("Full-time");
    setFormSalary("");
    setFormHybrid(false);
    setFormDesc("");
    setFormReqs("");
    setFormEmail("");
    setFormApplyLink("");
    setError("");
  }

  async function loadJobs() {
    const [approvedRes, myRes] = await Promise.all([
      supabase.from("opportunities").select("*").eq("status", "approved").order("created_at", { ascending: false }),
      user ? supabase.from("opportunities").select("*").eq("posted_by", user.id).in("status", ["pending", "approved"]).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    ]);
    if (approvedRes.data) setJobs(approvedRes.data);
    if (myRes.data) setMyPosts(myRes.data);
    setLoading(false);
  }

  useEffect(() => { loadJobs(); }, [user]);

  async function handlePostJob() {
    if (!formTitle || !formCompany) {
      setError("Job title and company are required.");
      return;
    }
    setPosting(true);
    setError("");
    const { error: insertError } = await supabase.from("opportunities").insert({
      title: formTitle,
      company: formCompany,
      location: formLocation || null,
      type: formType,
      salary_range: formSalary || null,
      hybrid: formHybrid || false,
      description: formDesc || null,
      requirements: formReqs || null,
      email: formEmail || null,
      apply_link: formApplyLink || null,
      posted_by: user?.id || null,
      status: "pending",
    });
    setPosting(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      setPostOpen(false);
      resetForm();
      loadJobs();
    }
  }

  async function handleClosePost(id: string) {
    await supabase.from("opportunities").update({ status: "closed" }).eq("id", id);
    setMyPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: "closed" } : p));
  }

  const statusBadge: Record<string, { class: string; label: string }> = {
    approved: { class: "bg-green-100 text-green-700", label: "Approved" },
    pending: { class: "bg-amber-100 text-amber-700", label: "Pending" },
    closed: { class: "bg-gray-100 text-gray-500", label: "Closed" },
  };

  const filtered = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      (j.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (j.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (j.salary_range ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "All" || j.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-cvsu-dark">Job Referral Board</h1>
            <p className="mt-1 text-sm text-cvsu-green/60">
              Browse opportunities posted by fellow alumni
            </p>
          </div>
          <Button
            onClick={() => setPostOpen(true)}
            className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green"
          >
            <Plus className="h-4 w-4" />
            Post a job
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setTab("browse")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tab === "browse" ? "bg-cvsu-dark text-white" : "border border-cvsu-green/20 text-cvsu-green/70"}`}>Browse Jobs</button>
          <button onClick={() => setTab("myposts")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tab === "myposts" ? "bg-cvsu-dark text-white" : "border border-cvsu-green/20 text-cvsu-green/70"}`}>My Posts ({myPosts.length})</button>
        </div>

        {/* Browse Jobs */}
        {tab === "browse" && (
        <>
        {/* Search & filter */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
            <Input
              placeholder="Search jobs, companies, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-cvsu-green/20 pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  selectedType === type
                    ? "border-cvsu-dark bg-cvsu-dark text-white"
                    : "border-cvsu-green/20 text-cvsu-green/70 hover:border-cvsu-green/40"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Job cards */}
        <div className="space-y-4">
          {loading ? (
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardContent className="flex flex-col items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-cvsu-green/30" />
                <h3 className="mt-4 font-medium text-cvsu-dark">Loading opportunities...</h3>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardContent className="flex flex-col items-center py-12">
                <Briefcase className="h-12 w-12 text-cvsu-green/30" />
                <h3 className="mt-4 font-medium text-cvsu-dark">
                  {jobs.length === 0 ? "No jobs posted yet." : "No jobs found"}
                </h3>
                <p className="mt-1 text-sm text-cvsu-green/60">
                  {jobs.length === 0
                    ? "Check back later for new opportunities."
                    : search
                      ? "Try a different search term."
                      : "No job postings for this type."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((job) => (
              <Card
                key={job.id}
                className="border-cvsu-green/10 shadow-sm transition hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cvsu-dark text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                      <div>
                        <h3 className="font-medium text-cvsu-dark">{job.title}</h3>
                        <p className="text-sm text-cvsu-green/60">{job.company}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          job.type === "Full-time"
                            ? "bg-cvsu-green/10 text-cvsu-green w-fit"
                            : job.type === "Freelance" || job.type === "Remote"
                              ? "bg-cvsu-green/10 text-cvsu-dark w-fit"
                              : "bg-blue-50 text-blue-600 w-fit"
                        }
                      >
                        {job.type}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-cvsu-green/50">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}{job.hybrid ? " (Hybrid)" : ""}
                      </span>
                      {job.salary_range && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary_range}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(job.created_at).toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-cvsu-green/70">{job.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(job.requirements ?? "").split("\n").filter(Boolean).map((req) => (
                        <Badge
                          key={req}
                          variant="outline"
                          className="border-cvsu-green/10 text-xs text-cvsu-green/60"
                        >
                          {req}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-cvsu-green/20 text-cvsu-green"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Details
                      </Button>
                      {job.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-cvsu-green/20 text-cvsu-green"
                          onClick={() => window.location.href = `mailto:${job.email}`}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </>
        )}

        {/* My Posts */}
        {tab === "myposts" && (
        <div className="space-y-4">
          {myPosts.length === 0 ? (
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardContent className="flex flex-col items-center py-12">
                <Briefcase className="h-12 w-12 text-cvsu-green/30" />
                <h3 className="mt-4 font-medium text-cvsu-dark">You haven't posted any jobs yet.</h3>
                <p className="mt-1 text-sm text-cvsu-green/60">Click "Post a job" to share an opportunity.</p>
              </CardContent>
            </Card>
          ) : (
            myPosts.map((job) => (
              <Card key={job.id} className="border-cvsu-green/10 shadow-sm transition hover:shadow-md">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cvsu-dark text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-cvsu-dark">{job.title}</h3>
                        <p className="text-sm text-cvsu-green/60">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusBadge[job.status]?.class || "bg-gray-100 text-gray-500"}>
                          {statusBadge[job.status]?.label || job.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-cvsu-green/50">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}{job.hybrid ? " (Hybrid)" : ""}</span>
                      {job.salary_range && <span className="flex items-center gap-1">{job.salary_range}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {job.status !== "closed" && (
                        <Button variant="outline" size="sm" className="border-red-200 text-red-500" onClick={() => handleClosePost(job.id)}>
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        )}
      </div>

      {/* Post Job Dialog */}
      <Dialog open={postOpen} onOpenChange={(open) => { setPostOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Post a job opportunity</DialogTitle>
            <DialogDescription>
              Share a job opening with the CvSU Naic alumni community. Your posting will be reviewed by admin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job title *</Label>
                <Input id="job-title" placeholder="e.g. Software Engineer" className="border-cvsu-green/20" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-name">Company *</Label>
                <Input id="company-name" placeholder="Company name" className="border-cvsu-green/20" value={formCompany} onChange={(e) => setFormCompany(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-location">Location</Label>
                <Input id="job-location" placeholder="City" className="border-cvsu-green/20" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-type">Type</Label>
                <select id="job-type" className="flex h-10 w-full rounded-lg border border-cvsu-green/20 bg-white px-3 py-2 text-sm text-cvsu-dark outline-none focus:border-cvsu-dark" value={formType} onChange={(e) => setFormType(e.target.value)}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Freelance</option>
                  <option>Remote</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary-range">Salary range</Label>
                <Input id="salary-range" placeholder="e.g. ₱25,000 – ₱40,000" className="border-cvsu-green/20" value={formSalary} onChange={(e) => setFormSalary(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Work setup</Label>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-cvsu-green/20 px-3">
                  <input id="hybrid" type="checkbox" className="h-4 w-4 accent-cvsu-dark" checked={formHybrid} onChange={(e) => setFormHybrid(e.target.checked)} />
                  <Label htmlFor="hybrid" className="text-sm font-normal text-cvsu-green/70">Hybrid / Remote eligible</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-desc">Job description</Label>
              <Textarea id="job-desc" placeholder="Describe the role..." className="border-cvsu-green/20" rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-reqs">Requirements</Label>
              <Textarea id="job-reqs" placeholder="One per line" className="border-cvsu-green/20" rows={3} value={formReqs} onChange={(e) => setFormReqs(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact email</Label>
                <Input id="contact-email" type="email" placeholder="hr@company.com" className="border-cvsu-green/20" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apply-link">Apply link (optional)</Label>
                <Input id="apply-link" placeholder="https://..." className="border-cvsu-green/20" value={formApplyLink} onChange={(e) => setFormApplyLink(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setPostOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handlePostJob} disabled={posting} className="bg-cvsu-dark text-white hover:bg-cvsu-green">
              {posting ? "Posting..." : "Post job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
