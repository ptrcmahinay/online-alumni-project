import { useEffect, useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";

export const Route = createFileRoute("/events")({
  component: EventsPage,
});

const typeColors: Record<string, string> = {
  Meetup: "bg-blue-100 text-blue-700",
  Webinar: "bg-purple-100 text-purple-700",
  "Job Fair": "bg-emerald-100 text-emerald-700",
  Workshop: "bg-amber-100 text-amber-700",
  Announcement: "bg-cvsu-green/20 text-cvsu-dark",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function EventsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("upcoming");
  const [events, setEvents] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [attendeeNames, setAttendeeNames] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [eventsRes, rsvpsRes, profileRes] = await Promise.all([
      supabase.from("events").select("*").order("date", { ascending: true }),
      supabase.from("event_rsvps").select("event_id, user_id, profiles(full_name)").eq("status", "attending"),
      supabase.from("profiles").select("course").eq("id", user?.id).maybeSingle(),
    ]);

    const eventsData = eventsRes.data;
    const rsvpsData = rsvpsRes.data;
    const userCourse = (profileRes.data as { course: string | null } | null)?.course;

    if (!eventsData) { setLoading(false); return; }
    const filtered = eventsData.filter((e) => {
      if (!e.target_course) return true;
      if (!userCourse) return false;
      return e.target_course === userCourse;
    });

    const userRsvps = new Set<string>();
    const counts: Record<string, number> = {};
    const names: Record<string, string[]> = {};

    for (const r of rsvpsData ?? []) {
      const eid = (r as any).event_id;
      counts[eid] = (counts[eid] || 0) + 1;
      if (!names[eid]) names[eid] = [];
      const fn = (r as any).profiles?.full_name;
      if (fn) names[eid].push(fn);
      if (user && (r as any).user_id === user.id) userRsvps.add(eid);
    }

    setRsvpCounts(counts);
    setAttendeeNames(names);
    setRsvps(userRsvps);
    setEvents(filtered);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function toggleRsvp(eventId: string, attending: boolean) {
    if (!user) return;
    setToggling(eventId);
    if (attending) {
      await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", user.id);
    } else {
      await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user.id, status: "attending" });
    }
    setToggling(null);
    loadData();
  }

  const filtered = tab === "my"
    ? events.filter((e) => rsvps.has(e.id))
    : events;

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-cvsu-dark">Events & Announcements</h1>
          <p className="mt-1 text-sm text-cvsu-green/60">
            Stay connected with alumni events and school updates
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="border-cvsu-green/10 bg-white">
            <TabsTrigger value="upcoming">All Events</TabsTrigger>
            <TabsTrigger value="my">My RSVPs ({rsvps.size})</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-cvsu-green/60">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-cvsu-green/60">
                {tab === "my" ? "You haven't RSVP'd to any events yet." : "No events yet."}
              </p>
            ) : (
              filtered.map((event) => {
                const isAttending = rsvps.has(event.id);
                const count = rsvpCounts[event.id] || 0;
                const names = attendeeNames[event.id] || [];
                return (
                  <Card
                    key={event.id}
                    className="border-cvsu-green/10 shadow-sm transition hover:shadow-md"
                  >
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-center sm:gap-0">
                        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-cvsu-dark text-white">
                          <span className="text-xs font-medium uppercase">
                            {event.date ? new Date(event.date).toLocaleString("en", { month: "short" }) : "N/A"}
                          </span>
                          <span className="text-lg font-bold leading-tight">
                            {event.date ? new Date(event.date).getDate() : "—"}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-cvsu-dark">{event.title}</h3>
                            </div>
                            <Badge className={`mt-1 ${typeColors[event.type]} text-xs`}>{event.type}</Badge>
                            {event.target_course && (
                              <Badge className="mt-1 bg-amber-100 text-amber-700 text-xs">{event.target_course} only</Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-cvsu-green/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {event.date}
                          </span>
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {event.time}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {event.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {count}{event.max_attendees ? `/${event.max_attendees}` : ""}
                          </span>
                        </div>

                        {event.description && (
                          <p className="mt-2 text-sm text-cvsu-green/70">{event.description}</p>
                        )}

                        {/* Attendees avatars */}
                        {names.length > 0 && (
                          <div className="mt-3 flex items-center gap-1">
                            <div className="flex -space-x-1.5">
                              {names.slice(0, 5).map((name, i) => (
                                <Avatar key={i} className="h-6 w-6 border-2 border-white">
                                  <AvatarFallback className="bg-cvsu-dark/10 text-[10px] text-cvsu-dark">
                                    {getInitials(name)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <span className="text-xs text-cvsu-green/50 ml-1">
                              {names.length > 5 ? `${names.slice(0, 5).join(", ")} +${names.length - 5} more` : names.join(", ")}
                            </span>
                          </div>
                        )}

                        <div className="mt-4">
                          <Button
                            size="sm"
                            variant={isAttending ? "outline" : "default"}
                            onClick={() => toggleRsvp(event.id, isAttending)}
                            disabled={toggling === event.id}
                            className={
                              isAttending
                                ? "gap-1.5 border-cvsu-green/20 text-cvsu-green"
                                : "gap-1.5 bg-cvsu-dark text-white hover:bg-cvsu-green"
                            }
                          >
                            {toggling === event.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isAttending ? (
                              <X className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}
                            {isAttending ? "Cancel RSVP" : "RSVP"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
