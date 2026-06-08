import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, TrendingUp, Building2, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/employment")({
  component: AdminEmploymentPage,
});

function AdminEmploymentPage() {
  const [industryData, setIndustryData] = useState<{ industry: string; count: number; pct: number }[]>([]);
  const [topCompanies, setTopCompanies] = useState<{ name: string; alumni: number; industry: string }[]>([]);
  const [stats, setStats] = useState([
    { label: "Total Records", value: "0", change: "", icon: FileText, color: "text-cvsu-dark bg-cvsu-green/20" },
    { label: "Industries", value: "0", change: "", icon: Building2, color: "text-cvsu-dark bg-cvsu-green/20" },
    { label: "Companies", value: "0", change: "", icon: Briefcase, color: "text-cvsu-dark bg-cvsu-green/20" },
    { label: "Employment Rate", value: "0%", change: "", icon: TrendingUp, color: "text-cvsu-dark bg-cvsu-green/20" },
  ]);

  useEffect(() => {
    async function loadData() {
      const indRes = await supabase.from("profiles").select("industry").not("industry", "is", null);
      if (indRes.data) {
        const counts: Record<string, number> = {};
        indRes.data.forEach((p) => {
          if (p.industry) counts[p.industry] = (counts[p.industry] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        setIndustryData(
          Object.entries(counts)
            .map(([industry, count]) => ({ industry, count, pct: Math.round((count / total) * 100) }))
            .sort((a, b) => b.count - a.count)
        );
      }

      const compRes = await supabase.from("careers").select("company, profiles!inner(industry)");
      if (compRes.data) {
        const counts: Record<string, { count: number; industry: string }> = {};
        compRes.data.forEach((c: any) => {
          if (!counts[c.company]) counts[c.company] = { count: 0, industry: c.profiles?.industry || "—" };
          counts[c.company].count++;
        });
        setTopCompanies(
          Object.entries(counts)
            .map(([name, info]) => ({ name, alumni: info.count, industry: info.industry }))
            .sort((a, b) => b.alumni - a.alumni)
            .slice(0, 10)
        );
      }

      const [profilesRes, careersRes] = await Promise.all([
        supabase.from("profiles").select("employment_status"),
        supabase.from("careers").select("company"),
      ]);
      const employed =
        profilesRes.data?.filter((p) => p.employment_status && p.employment_status !== "unemployed").length ?? 0;
      const total = profilesRes.data?.length ?? 1;
      const companies = new Set(careersRes.data?.map((c) => c.company) || []);
      const industries = new Set(profilesRes.data?.map((p) => p.employment_status).filter(Boolean) || []);
      setStats([
        { label: "Total Records", value: String(profilesRes.data?.length || 0), change: "", icon: FileText, color: "text-cvsu-dark bg-cvsu-green/20" },
        { label: "Industries", value: String(industries.size), change: "", icon: Building2, color: "text-cvsu-dark bg-cvsu-green/20" },
        { label: "Companies", value: String(companies.size), change: "", icon: Briefcase, color: "text-cvsu-dark bg-cvsu-green/20" },
        { label: "Employment Rate", value: `${Math.round((employed / total) * 100)}%`, change: "", icon: TrendingUp, color: "text-cvsu-dark bg-cvsu-green/20" },
      ]);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-cvsu-dark">Employment Tracking</h1>
        <p className="mt-1 text-sm text-cvsu-green/60">
          Employment statistics and reports for alumni
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-cvsu-green/10 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${s.color}`} />
                  <span className="text-xs font-medium text-emerald-600">{s.change}</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-cvsu-dark">{s.value}</div>
                <div className="text-xs text-cvsu-green/60">{s.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Industry Distribution */}
        <Card className="border-cvsu-green/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
              <Briefcase className="h-4 w-4 text-cvsu-green" />
              Industry Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {industryData.map((item) => (
              <div key={item.industry}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cvsu-dark">{item.industry}</span>
                  <span className="text-cvsu-green/60">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-cvsu-green/10">
                  <div
                    className="h-full rounded-full bg-cvsu-dark transition-all"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card className="border-cvsu-green/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
              <Building2 className="h-4 w-4 text-cvsu-green" />
              Top Employers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead className="text-right">Alumni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCompanies.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium text-cvsu-dark">{c.name}</TableCell>
                    <TableCell className="text-cvsu-green/60">{c.industry}</TableCell>
                    <TableCell className="text-right font-medium text-cvsu-dark">{c.alumni}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
