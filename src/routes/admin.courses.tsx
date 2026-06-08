import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import type { Course, Profile } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BookOpen,
  Users,
  ArrowLeft,
  Search,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/admin/courses")({
  component: AdminCoursesPage,
});

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function AdminCoursesPage() {
  const [courses, setCourses] = useState<(Course & { count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [alumni, setAlumni] = useState<Profile[]>([]);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("courses").select("*").order("name"),
      supabase.from("profiles").select("course"),
    ]).then(([coursesRes, profilesRes]) => {
      const countMap: Record<string, number> = {};
      for (const p of profilesRes.data ?? []) {
        if (p.course) countMap[p.course] = (countMap[p.course] || 0) + 1;
      }
      const merged = (coursesRes.data ?? []).map((c) => ({
        ...c,
        count: countMap[c.code] ?? 0,
      }));
      setCourses(merged);
      setLoading(false);
    });
  }, []);

  async function loadAlumni(courseCode: string) {
    setAlumniLoading(true);
    setSelectedCourse(courseCode);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("course", courseCode)
      .order("full_name");
    if (data) setAlumni(data);
    setAlumniLoading(false);
  }

  const filteredAlumni = alumni.filter(
    (a) =>
      !search ||
      a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.batch?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCourseName = courses.find((c) => c.code === selectedCourse)?.name ?? selectedCourse;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-cvsu-dark">Course Management</h1>
        <p className="mt-1 text-sm text-cvsu-green/60">
          {selectedCourse
            ? `Alumni in ${selectedCourseName}`
            : "Browse courses and view enrolled alumni"}
        </p>
      </div>

      {selectedCourse ? (
        <>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedCourse(null); setAlumni([]); setSearch(""); }}
              className="gap-1.5 text-cvsu-green/60"
            >
              <ArrowLeft className="h-4 w-4" />
              All courses
            </Button>
            <div className="relative ml-auto">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
              <Input
                placeholder="Search alumni..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 border-cvsu-green/20 pl-8 text-sm lg:w-64"
              />
            </div>
          </div>

          <Card className="border-cvsu-green/10 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-cvsu-dark flex items-center gap-2">
                <Users className="h-4 w-4 text-cvsu-green" />
                {selectedCourseName} — {alumni.length} alumni
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {alumniLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-cvsu-green/60">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Student #</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Employment</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlumni.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-cvsu-green/60 py-8">
                          {search ? "No alumni match your search." : "No alumni in this course."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAlumni.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-7 w-7">
                                {a.avatar_url ? <AvatarImage src={a.avatar_url} /> : null}
                                <AvatarFallback className="bg-cvsu-dark/10 text-xs text-cvsu-dark">
                                  {getInitials(a.full_name ?? "")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-cvsu-dark">{a.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-cvsu-green/60">{a.student_number ?? "—"}</TableCell>
                          <TableCell className="text-sm text-cvsu-green/60">{a.batch ?? "—"}</TableCell>
                          <TableCell>
                            {a.employment_status ? (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                                {a.employment_status}
                              </Badge>
                            ) : (
                              <span className="text-sm text-cvsu-green/40">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-cvsu-green/60">{a.location ?? "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12 text-sm text-cvsu-green/60">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : (
            courses.map((course) => (
              <button
                key={course.id}
                onClick={() => loadAlumni(course.code)}
                className="text-left"
              >
                <Card className="border-cvsu-green/10 shadow-sm transition hover:shadow-md hover:border-cvsu-green/30 h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cvsu-dark/5 text-cvsu-dark">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="bg-cvsu-green/10 text-cvsu-dark">
                        <Users className="mr-1 h-3 w-3" />
                        {course.count}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="text-lg font-semibold text-cvsu-dark">{course.code}</div>
                      <div className="text-sm text-cvsu-green/60">{course.name}</div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
