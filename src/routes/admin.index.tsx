import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserPlus,
  Briefcase,
  Calendar,
  Gift,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  GraduationCap,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [kpis, setKpis] = useState([
    { label: "Total Alumni", value: "0", change: "", icon: Users, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
    { label: "Active", value: "0", change: "", icon: UserCheck, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
    { label: "New Registrations", value: "0", change: "", icon: UserPlus, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
    { label: "Employment Rate", value: "0%", change: "", icon: Briefcase, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
    { label: "Upcoming Events", value: "0", change: "", icon: Calendar, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
    { label: "Donations", value: "₱0", change: "", icon: Gift, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
  ]);

  const [recentActivity, setRecentActivity] = useState<{ user: string; action: string; time: string }[]>([]);

  const [byBatch, setByBatch] = useState<{ year: string; count: number }[]>([]);

  const [regOverview, setRegOverview] = useState({ total: 0, withProfile: 0, verified: 0 });

  const [employmentDist, setEmploymentDist] = useState<{ label: string; count: number }[]>([]);

  const [byCourse, setByCourse] = useState<{ course: string; count: number }[]>([]);

  const [topLocations, setTopLocations] = useState<{ location: string; count: number }[]>([]);

  useEffect(() => {
    async function loadKpis() {
      const [profilesRes, eventsRes, donationsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "upcoming"),
        supabase.from("donations").select("amount"),
      ]);

      const total = profilesRes.count ?? 0;
      const eventsCount = eventsRes.count ?? 0;
      const donations = donationsRes.data ?? [];
      const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

      setKpis([
        { label: "Total Alumni", value: String(total), change: "", icon: Users, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
        { label: "Active", value: String(total), change: "", icon: UserCheck, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
        { label: "New Registrations", value: "—", change: "", icon: UserPlus, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
        { label: "Employment Rate", value: "—", change: "", icon: Briefcase, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
        { label: "Upcoming Events", value: String(eventsCount), change: "", icon: Calendar, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
        { label: "Donations", value: `₱${(totalDonations / 1000).toFixed(0)}K`, change: "", icon: Gift, color: "text-cvsu-dark bg-cvsu-green/20", up: true },
      ]);
    }
    loadKpis();
  }, []);

  useEffect(() => {
    async function loadActivity() {
      const [annRes, evtRes, oppRes] = await Promise.all([
        supabase.from("announcements").select("title, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("events").select("title, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("opportunities").select("title, created_at").order("created_at", { ascending: false }).limit(3),
      ]);

      const items = [
        ...(annRes.data?.map(a => ({ user: "System", action: `Posted announcement: ${a.title}`, time: new Date(a.created_at).toLocaleDateString() })) || []),
        ...(evtRes.data?.map(e => ({ user: "System", action: `Created event: ${e.title}`, time: new Date(e.created_at).toLocaleDateString() })) || []),
        ...(oppRes.data?.map(o => ({ user: "System", action: `New job post: ${o.title}`, time: new Date(o.created_at).toLocaleDateString() })) || []),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setRecentActivity(items.length > 0 ? items : [{ user: "System", action: "No recent activity", time: "" }]);
    }
    loadActivity();
  }, []);

  useEffect(() => {
    supabase.from("profiles").select("batch").not("batch", "is", null).then(({ data }) => {
      if (!data) return;
      const counts: Record<string, number> = {};
      data.forEach(p => { if (p.batch) counts[p.batch] = (counts[p.batch] || 0) + 1; });
      setByBatch(Object.entries(counts).map(([year, count]) => ({ year, count })).sort((a, b) => a.year.localeCompare(b.year)));
    });
  }, []);

  useEffect(() => {
    supabase.from("profiles").select("batch").not("batch", "is", null).then(({ data }) => {
      if (!data) return;
      const counts: Record<string, number> = {};
      data.forEach(p => { if (p.batch) counts[p.batch] = (counts[p.batch] || 0) + 1; });
      setByBatch(Object.entries(counts).map(([year, count]) => ({ year, count })).sort((a, b) => a.year.localeCompare(b.year)));
    });
  }, []);

  useEffect(() => {
    async function load() {
      const all = await supabase.from("profiles").select("full_name, employment_status, course, location");
      const data = all.data || [];

      setRegOverview({
        total: data.length,
        withProfile: data.filter((p) => p.full_name && p.full_name.trim()).length,
        verified: data.length,
      });

      const emap: Record<string, number> = {};
      data.forEach((p) => {
        const s = p.employment_status || "not-specified";
        emap[s] = (emap[s] || 0) + 1;
      });
      const statusLabels: Record<string, string> = {
        employed: "Employed", "self-employed": "Self-Employed", freelance: "Freelance",
        unemployed: "Unemployed", "continuing-education": "Continuing Education", "not-specified": "Not Specified",
      };
      setEmploymentDist(
        Object.entries(emap)
          .map(([key, count]) => ({ label: statusLabels[key] || key, count }))
          .sort((a, b) => b.count - a.count),
      );

      const cmap: Record<string, number> = {};
      data.forEach((p) => {
        if (p.course) cmap[p.course] = (cmap[p.course] || 0) + 1;
      });
      setByCourse(
        Object.entries(cmap)
          .map(([course, count]) => ({ course, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      );

      const lmap: Record<string, number> = {};
      data.forEach((p) => {
        const loc = p.location?.split(",")[0]?.trim();
        if (loc) lmap[loc] = (lmap[loc] || 0) + 1;
      });
      setTopLocations(
        Object.entries(lmap)
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      );
    }
    load();
  }, []);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-cvsu-dark">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-cvsu-green/60">
          Overview of the CvSU Naic alumni community
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-cvsu-green/10 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${kpi.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      kpi.up ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {kpi.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {kpi.change}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-cvsu-dark">{kpi.value}</div>
                  <div className="text-xs text-cvsu-green/60">{kpi.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Registered Users */}
        <Card className="border-cvsu-green/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
              <TrendingUp className="h-4 w-4 text-cvsu-green" />
              Registration Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cvsu-green/60">Total registered users</span>
                <span className="font-medium text-cvsu-dark">{regOverview.total}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cvsu-green/60">With complete profiles</span>
                <span className="font-medium text-cvsu-dark">{regOverview.withProfile}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cvsu-green/60">Verified alumni</span>
                <span className="font-medium text-cvsu-dark">{regOverview.verified}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-cvsu-green/60">
                <span>Profile completion</span>
                <span>{regOverview.total > 0 ? Math.round((regOverview.withProfile / regOverview.total) * 100) : 0}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-cvsu-green/10">
                <div
                  className="h-full rounded-full bg-cvsu-green transition-all"
                  style={{ width: `${regOverview.total > 0 ? (regOverview.withProfile / regOverview.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alumni by Batch */}
        <Card className="border-cvsu-green/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
              <GraduationCap className="h-4 w-4 text-cvsu-green" />
              Alumni by Batch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byBatch.map((b) => {
              const max = Math.max(...byBatch.map((x) => x.count));
              const pct = (b.count / max) * 100;
              return (
                <div key={b.year}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-cvsu-dark">Batch {b.year}</span>
                    <span className="text-cvsu-green/60">{b.count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-cvsu-green/10">
                    <div
                      className="h-full rounded-full bg-cvsu-dark transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-cvsu-green/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
              <Users className="h-4 w-4 text-cvsu-green" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.user + a.time} className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-cvsu-green/40" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-cvsu-dark">{a.user}</span>{" "}
                  <span className="text-sm text-cvsu-green/60">{a.action}</span>
                  <div className="text-xs text-cvsu-green/40">{a.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Employment Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-cvsu-green/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
              <Briefcase className="h-4 w-4 text-cvsu-green" />
              Employment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employmentDist.map((e) => {
                const max = Math.max(...employmentDist.map((x) => x.count), 1);
                const pct = Math.round((e.count / max) * 100);
                return (
                  <div key={e.label}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-cvsu-dark" />
                        <span className="text-cvsu-dark">{e.label}</span>
                      </div>
                      <span className="text-sm text-cvsu-green/60">{e.count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-cvsu-green/10">
                      <div
                        className="h-full rounded-full bg-cvsu-dark transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-cvsu-green/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
              <GraduationCap className="h-4 w-4 text-cvsu-green" />
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-cvsu-green/10 p-4">
                <div className="text-xs text-cvsu-green/60">Alumni by Course</div>
                <div className="mt-2 space-y-1 text-sm">
                  {byCourse.map((c) => (
                    <div key={c.course} className="flex justify-between">
                      <span className="text-cvsu-dark">{c.course}</span>
                      <span className="text-cvsu-green/60">{c.count}</span>
                    </div>
                  ))}
                  {byCourse.length === 0 && (
                    <span className="text-xs text-cvsu-green/40">No data</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-cvsu-green/10 p-4">
                <div className="text-xs text-cvsu-green/60">Top Locations</div>
                <div className="mt-2 space-y-1 text-sm">
                  {topLocations.map((l) => (
                    <div key={l.location} className="flex justify-between">
                      <span className="text-cvsu-dark">{l.location}</span>
                      <span className="text-cvsu-green/60">{l.count}</span>
                    </div>
                  ))}
                  {topLocations.length === 0 && (
                    <span className="text-xs text-cvsu-green/40">No data</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
