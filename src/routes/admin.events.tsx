import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Calendar,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/events")({
  component: AdminEventsPage,
});

const INITIAL_FORM = {
  title: "",
  type: "Meetup",
  target_course: "",
  max_attendees: "",
  location: "",
  description: "",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function AdminEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formDate, setFormDate] = useState<Date | undefined>(undefined);
  const [formHour, setFormHour] = useState(12);
  const [formMinute, setFormMinute] = useState(0);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventAttendees, setEventAttendees] = useState<any[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  function loadEvents() {
    supabase.from("events").select("*").order("date", { ascending: false }).then(({ data }) => {
      if (data) setEvents(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadAttendees(eventId: string) {
    setAttendeesLoading(true);
    setSelectedEventId(eventId);
    const { data } = await supabase
      .from("event_rsvps")
      .select("*, profiles(full_name, avatar_url)")
      .eq("event_id", eventId);
    if (data) {
      setEventAttendees(data.map((a: any) => ({
        name: a.profiles?.full_name || "Unknown",
        avatar_url: a.profiles?.avatar_url,
        status: a.status,
      })));
    } else {
      setEventAttendees([]);
    }
    setAttendeesLoading(false);
  }

  function resetForm() {
    setForm({ ...INITIAL_FORM });
    setFormDate(undefined);
    setFormHour(12);
    setFormMinute(0);
  }

  async function handleCreate() {
    if (!form.title || !formDate) return;
    setSaving(true);
    setCreateError("");
    const dateStr = format(formDate, "yyyy-MM-dd");
    const timeStr = `${String(formHour).padStart(2, "0")}:${String(formMinute).padStart(2, "0")}`;
    const { error } = await supabase.from("events").insert({
      title: form.title,
      type: form.type,
      target_course: form.target_course || null,
      max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
      date: dateStr,
      time: timeStr,
      location: form.location || null,
      description: form.description || null,
      status: "upcoming",
      created_by: user?.id || null,
    });
    if (error) {
      setSaving(false);
      setCreateError(error.message);
      return;
    }
    // Send in-app notifications to relevant alumni
    const notifQuery = supabase.from("profiles").select("id").neq("id", user?.id);
    if (form.target_course) {
      notifQuery.eq("course", form.target_course);
    }
    const { data: recipients } = await notifQuery;
    if (recipients && recipients.length > 0) {
      await supabase.from("notifications").insert(
        recipients.map((r: any) => ({
          user_id: r.id,
          type: "event",
          title: `New event: ${form.title}`,
          message: `${form.type} on ${dateStr} at ${timeStr}${form.location ? ` — ${form.location}` : ""}`,
        }))
      );
      // Send email notifications via edge function (silently skip if not deployed)
      supabase.functions.invoke("send-event-notification", {
        body: {
          userIds: recipients.map((r: any) => r.id),
          eventTitle: form.title,
          eventType: form.type,
          eventDate: dateStr,
          eventTime: timeStr,
          eventLocation: form.location || null,
          eventDescription: form.description || null,
        },
      }).catch(() => {}); // ignore if edge function not deployed yet
    }
    setSaving(false);
    setCreateOpen(false);
    resetForm();
    loadEvents();
  }

  const upcoming = events.filter((e) => e.status === "upcoming");
  const completed = events.filter((e) => e.status === "completed");

  const timeString = `${String(formHour).padStart(2, "0")}:${String(formMinute).padStart(2, "0")}`;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cvsu-dark">Events Management</h1>
          <p className="mt-1 text-sm text-cvsu-green/60">Create and manage alumni events</p>
        </div>
        <Button
          onClick={() => { setCreateOpen(true); setCreateError(""); }}
          className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green"
        >
          <Plus className="h-4 w-4" />
          Create event
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="border-cvsu-green/10 bg-white">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {loading ? (
            <p className="text-sm text-cvsu-green/60">Loading...</p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-cvsu-green/60">No upcoming events.</p>
          ) : (
            upcoming.map((event) => (
              <Card key={event.id} className="border-cvsu-green/10 shadow-sm">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-cvsu-dark text-white">
                      <span className="text-xs font-medium uppercase">
                        {event.date ? format(new Date(event.date), "MMM") : "N/A"}
                      </span>
                      <span className="text-lg font-bold leading-tight">
                        {event.date ? format(new Date(event.date), "d") : "—"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-cvsu-dark">{event.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-cvsu-green/60">
                        <Badge variant="secondary" className="bg-cvsu-green/10 text-cvsu-dark">{event.type}</Badge>
                        {event.target_course && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">{event.target_course} only</Badge>
                        )}
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.date}</span>
                        {event.time && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time}</span>
                        )}
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {event.max_attendees ?? "—"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          {loading ? (
            <p className="text-sm text-cvsu-green/60">Loading...</p>
          ) : completed.length === 0 ? (
            <p className="text-sm text-cvsu-green/60">No completed events.</p>
          ) : (
            completed.map((event) => (
              <Card key={event.id} className="border-cvsu-green/10 shadow-sm opacity-70">
                <CardContent className="flex items-center gap-4 p-5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div>
                    <h3 className="font-medium text-cvsu-dark">{event.title}</h3>
                    <div className="text-xs text-cvsu-green/60">{event.date} &middot; {event.type}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="attendees" className="mt-4 space-y-4">
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-cvsu-dark">
                {selectedEventId
                  ? `Attendees — ${events.find((e) => e.id === selectedEventId)?.title ?? "Event"}`
                  : "Select an event to view attendees"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!selectedEventId ? (
                <div className="p-4 space-y-2">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => loadAttendees(event.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-cvsu-green/10 p-3 text-left hover:bg-cvsu-light transition"
                    >
                      <div>
                        <div className="font-medium text-cvsu-dark">{event.title}</div>
                        <div className="text-xs text-cvsu-green/60">{event.date}</div>
                      </div>
                      <Badge variant="secondary" className="bg-cvsu-green/10 text-cvsu-dark">
                        <Users className="mr-1 h-3 w-3" />
                        {event.rsvp_count ?? "?"}
                      </Badge>
                    </button>
                  ))}
                  {events.length === 0 && (
                    <p className="text-sm text-cvsu-green/60 py-4 text-center">No events yet.</p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 border-b border-cvsu-green/10 px-4 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSelectedEventId(null); setEventAttendees([]); }}
                      className="text-xs text-cvsu-green/60"
                    >
                      &larr; All events
                    </Button>
                  </div>
                  {attendeesLoading ? (
                    <div className="flex items-center justify-center py-8 text-sm text-cvsu-green/60">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                    </div>
                  ) : eventAttendees.length === 0 ? (
                    <p className="p-4 text-sm text-cvsu-green/60">No attendees yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eventAttendees.map((a, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium text-cvsu-dark flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                {a.avatar_url ? <AvatarImage src={a.avatar_url} /> : null}
                                <AvatarFallback className="bg-cvsu-dark/10 text-[10px] text-cvsu-dark">
                                  {getInitials(a.name)}
                                </AvatarFallback>
                              </Avatar>
                              {a.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                {a.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create event</DialogTitle>
            <DialogDescription>Schedule a new alumni event</DialogDescription>
          </DialogHeader>
          {createError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {createError}
            </div>
          )}
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Event title</Label>
              <Input
                placeholder="Event title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="border-cvsu-green/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-cvsu-green/20 bg-white px-3 py-2 text-sm text-cvsu-dark"
                >
                  <option>Meetup</option>
                  <option>Webinar</option>
                  <option>Job Fair</option>
                  <option>Workshop</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Max attendees</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={form.max_attendees}
                  onChange={(e) => setForm((p) => ({ ...p, max_attendees: e.target.value }))}
                  className="border-cvsu-green/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target course (leave empty for all)</Label>
              <select
                value={form.target_course}
                onChange={(e) => setForm((p) => ({ ...p, target_course: e.target.value }))}
                className="flex h-10 w-full rounded-lg border border-cvsu-green/20 bg-white px-3 py-2 text-sm text-cvsu-dark"
              >
                <option value="">All courses</option>
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
                <option value="BSBA">BSBA</option>
                <option value="BSHM">BSHM</option>
                <option value="BSTM">BSTM</option>
                <option value="BSEd">BSEd</option>
                <option value="BECEd">BECEd</option>
                <option value="BPEd">BPEd</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start border-cvsu-green/20 text-left font-normal ${!formDate ? "text-cvsu-green/40" : "text-cvsu-dark"}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formDate ? format(formDate, "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={formDate}
                      onSelect={setFormDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <select
                  value={timeString}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(":").map(Number);
                    setFormHour(h);
                    setFormMinute(m);
                  }}
                  className="flex h-10 w-full rounded-lg border border-cvsu-green/20 bg-white px-3 py-2 text-sm text-cvsu-dark"
                >
                  {Array.from({ length: 48 }).map((_, i) => {
                    const h = Math.floor(i / 2);
                    const m = i % 2 === 0 ? 0 : 30;
                    const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                    return (
                      <option key={val} value={val}>
                        {h === 0 ? "12" : h > 12 ? String(h - 12) : String(h)}:
                        {String(m).padStart(2, "0")} {h < 12 ? "AM" : "PM"}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Venue or online link"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="border-cvsu-green/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Event description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="border-cvsu-green/20"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !form.title || !formDate}
              className="bg-cvsu-dark text-white hover:bg-cvsu-green"
            >
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Create event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
