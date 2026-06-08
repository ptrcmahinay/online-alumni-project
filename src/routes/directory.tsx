import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";
import AppLayout from "@/components/app-layout";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, GraduationCap, Users, Filter } from "lucide-react";

export const Route = createFileRoute("/directory")({
  component: DirectoryPage,
});

const locations = ["All", "Manila", "Cavite", "Laguna", "Batangas", "Rizal"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function DirectoryPage() {
  const [alumniData, setAlumniData] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<string[]>(["All"]);
  const [batches, setBatches] = useState<string[]>(["All"]);
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [batch, setBatch] = useState("All");
  const [location, setLocation] = useState("All");

  useEffect(() => {
    supabase.from("profiles").select("*").order("full_name").then(({ data }) => {
      if (data) setAlumniData(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    Promise.all([
      supabase.from("courses").select("name"),
      supabase.from("profiles").select("batch").not("batch", "is", null),
    ]).then(([courseRes, batchRes]) => {
      if (courseRes.data) setCourses(["All", ...courseRes.data.map((c) => c.name)]);
      if (batchRes.data) {
        const unique = [...new Set(batchRes.data.map((p) => p.batch).filter(Boolean))] as string[];
        setBatches(["All", ...unique.sort()]);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    return alumniData.filter((a) => {
      const matchSearch =
        a.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (a.course ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (a.location ?? "").toLowerCase().includes(search.toLowerCase());
      const matchCourse = course === "All" || a.course === course;
      const matchBatch = batch === "All" || a.batch === batch;
      const matchLocation = location === "All" || a.location === location;
      return matchSearch && matchCourse && matchBatch && matchLocation;
    });
  }, [search, course, batch, location, alumniData]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-cvsu-dark">Alumni Directory</h1>
          <p className="mt-1 text-sm text-cvsu-green/60">
            Browse and connect with fellow CvSU Naic graduates
          </p>
        </div>

        {/* Search & filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
            <Input
              placeholder="Search by name, course, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-cvsu-green/20 pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-cvsu-green/40" />
              <span className="text-xs font-medium text-cvsu-green/60">Course:</span>
              <div className="flex gap-1">
                {courses.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCourse(c)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                      course === c
                        ? "border-cvsu-dark bg-cvsu-dark text-white"
                        : "border-cvsu-green/20 text-cvsu-green/70 hover:border-cvsu-green/40"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-cvsu-green/40" />
              <span className="text-xs font-medium text-cvsu-green/60">Batch:</span>
              <div className="flex gap-1">
                {batches.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBatch(b)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                      batch === b
                        ? "border-cvsu-dark bg-cvsu-dark text-white"
                        : "border-cvsu-green/20 text-cvsu-green/70 hover:border-cvsu-green/40"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cvsu-green/40" />
              <span className="text-xs font-medium text-cvsu-green/60">Location:</span>
              <div className="flex gap-1">
                {locations.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocation(l)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                      location === l
                        ? "border-cvsu-dark bg-cvsu-dark text-white"
                        : "border-cvsu-green/20 text-cvsu-green/70 hover:border-cvsu-green/40"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-cvsu-green/60">
          {loading ? (
            "Loading..."
          ) : (
            <>
              Showing <span className="font-medium text-cvsu-dark">{filtered.length}</span> alumni
            </>
          )}
        </p>

        {/* Grid */}
        {loading ? (
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardContent className="flex flex-col items-center py-12">
              <Users className="h-12 w-12 text-cvsu-green/30" />
              <h3 className="mt-4 font-medium text-cvsu-dark">Loading alumni data...</h3>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardContent className="flex flex-col items-center py-12">
              <Users className="h-12 w-12 text-cvsu-green/30" />
              <h3 className="mt-4 font-medium text-cvsu-dark">No alumni found</h3>
              <p className="mt-1 text-sm text-cvsu-green/60">Try adjusting your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((alumni) => (
              <Card
                key={alumni.id}
                className="border-cvsu-green/10 shadow-sm transition hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-cvsu-dark text-xs text-white">
                        {getInitials(alumni.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-cvsu-dark">{alumni.full_name}</h3>
                      <p className="text-xs text-cvsu-green/60">{alumni.course} · Batch {alumni.batch}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-cvsu-green/50">
                    <MapPin className="h-3 w-3" />
                    {alumni.location}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        alumni.employment_status === "employed"
                          ? "bg-cvsu-green/10 text-cvsu-green"
                          : alumni.employment_status === "freelance"
                            ? "bg-amber-100 text-amber-700"
                            : alumni.employment_status === "unemployed"
                              ? "bg-gray-100 text-gray-600"
                              : alumni.employment_status === "self-employed"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                      }
                    >
                      {alumni.employment_status?.replace("-", " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
