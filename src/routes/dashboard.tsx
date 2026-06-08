import { Link, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Announcement, Event, Opportunity } from "@/lib/database.types";
import { useState, useEffect } from "react";
import {
  Calendar,
  Briefcase,
  User,
  FileText,
  Users,
  ArrowRight,
  GraduationCap,
  Megaphone,
  Sparkles,
  ChevronRight,
  MapPin,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const quickActions = [
  { icon: User, label: "Update Profile", to: "/profile", color: "bg-blue-500" },
  { icon: Briefcase, label: "Add Employment", to: "/employment", color: "bg-emerald-500" },
  { icon: FileText, label: "Post a Job", to: "/jobs", color: "bg-amber-500" },
  { icon: Users, label: "Find Alumni", to: "/directory", color: "bg-violet-500" },
];

function DashboardPage() {
  const { user, profile } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [jobs, setJobs] = useState<Opportunity[]>([]);
  const [verificationStatus, setVerificationStatus] = useState("pending");

  useEffect(() => {
    async function load() {
      const [annRes, evtRes, jobRes, profRes] = await Promise.all([
        supabase.from("announcements").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(3),
        supabase.from("events").select("*").order("date", { ascending: true }).limit(3),
        supabase.from("opportunities").select("*").eq("status", "approved").order("created_at", { ascending: false }).limit(3),
        supabase.from("profiles").select("verification_status").eq("id", user?.id).maybeSingle(),
      ]);
      if (annRes.data) setAnnouncements(annRes.data);
      if (evtRes.data) setEvents(evtRes.data);
      if (jobRes.data) setJobs(jobRes.data);
      if (profRes.data) setVerificationStatus((profRes.data as any).verification_status || "pending");
    }
    load();
  }, [user]);

  const verifBadge: Record<string, { class: string; label: string }> = {
    verified: { class: "bg-green-100 text-green-700", label: "Verified" },
    pending: { class: "bg-amber-100 text-amber-700", label: "Pending" },
    rejected: { class: "bg-red-100 text-red-700", label: "Rejected" },
  };
  const verifInfo = verifBadge[verificationStatus] || verifBadge.pending;
  const verifLabels: Record<string, string> = {
    verified: "Your alumni status has been verified",
    pending: "Awaiting verification by admin",
    rejected: "Your verification was rejected. Contact admin.",
  };

  const profileFields = [
    { label: "Personal Info", done: !!profile?.full_name },
    { label: "Student Number", done: false },
    { label: "Course & Batch", done: !!profile?.course && !!profile?.batch },
    { label: "Employment Status", done: false },
    { label: "Profile Picture", done: false },
    { label: "Resume Upload", done: false },
  ];

  const completed = profileFields.filter((f) => f.done).length;
  const progress = Math.round((completed / profileFields.length) * 100);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
        {/* Welcome */}
        <div className="rounded-xl bg-gradient-to-r from-cvsu-dark to-cvsu-green p-6 text-white lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cvsu-green" />
                <span className="text-xs font-medium uppercase tracking-wider text-cvsu-green/80">
                  Alumni Dashboard
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold lg:text-3xl">
                Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
              </h1>
              <p className="mt-1 text-sm text-white/70">{user?.email}</p>
            </div>
            <Link to="/profile">
              <Button
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                View profile
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Completion */}
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                <User className="h-4 w-4 text-cvsu-green" />
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl font-bold text-cvsu-dark">{progress}%</span>
                <span className="text-xs text-cvsu-green/60">{completed}/{profileFields.length} done</span>
              </div>
              <Progress value={progress} className="h-2 bg-cvsu-green/10 [&>div]:bg-cvsu-green" />
              <div className="mt-4 space-y-2">
                {profileFields.map((f) => (
                  <div key={f.label} className="flex items-center gap-2 text-sm">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        f.done ? "bg-cvsu-green" : "bg-cvsu-green/20"
                      }`}
                    />
                    <span className={f.done ? "text-cvsu-dark" : "text-cvsu-green/50"}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="mt-3 w-full text-cvsu-green">
                  Complete profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                <Sparkles className="h-4 w-4 text-cvsu-green" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.to}>
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-cvsu-green/10 p-4 text-center transition hover:border-cvsu-green/30 hover:shadow-sm">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-cvsu-dark">{action.label}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                <GraduationCap className="h-4 w-4 text-cvsu-green" />
                Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-cvsu-green/10 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cvsu-green/20">
                    <Mail className="h-4 w-4 text-cvsu-green" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-cvsu-dark">Email</div>
                    <div className="text-xs text-cvsu-green/60">{user?.email}</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Verified</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-cvsu-green/10 p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    verificationStatus === "verified" ? "bg-cvsu-green/20" :
                    verificationStatus === "rejected" ? "bg-red-100" :
                    "bg-amber-100"
                  }`}>
                    <User className={`h-4 w-4 ${
                      verificationStatus === "verified" ? "text-cvsu-green" :
                      verificationStatus === "rejected" ? "text-red-600" :
                      "text-amber-600"
                    }`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-cvsu-dark">Alumni Status</div>
                    <div className="text-xs text-cvsu-green/60">{verifLabels[verificationStatus]}</div>
                  </div>
                </div>
                <Badge className={verifInfo.class}>{verifInfo.label}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Announcements */}
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                <Megaphone className="h-4 w-4 text-cvsu-green" />
                Announcements
              </CardTitle>
              <Badge variant="outline" className="border-cvsu-green/20 text-xs">
                {announcements.length} new
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-cvsu-green/10 p-3 transition hover:border-cvsu-green/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-cvsu-dark">{a.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-cvsu-green/60">{a.content}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-cvsu-green/10 text-xs text-cvsu-dark">
                          {a.audience}
                        </Badge>
                        <span className="text-xs text-cvsu-green/40">
                          {new Date(a.schedule_date ?? a.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                <Calendar className="h-4 w-4 text-cvsu-green" />
                Upcoming Events
              </CardTitle>
              <Link to="/events" className="text-xs font-medium text-cvsu-green hover:text-cvsu-dark">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((e) => (
                <div
                  key={e.id}
                  className="rounded-lg border border-cvsu-green/10 p-3 transition hover:border-cvsu-green/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-cvsu-dark">{e.title}</span>
                      <div className="mt-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-cvsu-green/60">
                          <Calendar className="h-3 w-3" /> {new Date(e.date).toLocaleDateString()} at {e.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-cvsu-green/60">
                          <MapPin className="h-3 w-3" /> {e.location}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-cvsu-green/60">
                        <Users className="h-3 w-3" /> {e.max_attendees} attending
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                <Briefcase className="h-4 w-4 text-cvsu-green" />
                Recent Opportunities
              </CardTitle>
              <Link to="/jobs" className="text-xs font-medium text-cvsu-green hover:text-cvsu-dark">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="rounded-lg border border-cvsu-green/10 p-3 transition hover:border-cvsu-green/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-cvsu-dark">{j.title}</span>
                      <div className="mt-0.5 text-xs text-cvsu-green/60">{j.company}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-cvsu-green/10 text-xs text-cvsu-green"
                        >
                          {j.type}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-cvsu-green/40">
                          <MapPin className="h-3 w-3" /> {j.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
