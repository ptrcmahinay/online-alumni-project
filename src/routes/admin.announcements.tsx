import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Send,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/announcements")({
  component: AdminAnnouncementsPage,
});

function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [_selected, setSelected] = useState<any>(null);
  const [sendEmail, setSendEmail] = useState(false);

  useEffect(() => {
    supabase.from("announcements").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setAnnouncements(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cvsu-dark">Announcements</h1>
          <p className="mt-1 text-sm text-cvsu-green/60">Create and manage alumni announcements</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green"
        >
          <Plus className="h-4 w-4" />
          Create announcement
        </Button>
      </div>

      <Card className="border-cvsu-green/10 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-sm text-cvsu-green/60">Loading...</p>
          ) : announcements.length === 0 ? (
            <p className="p-4 text-sm text-cvsu-green/60">No announcements.</p>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between border-b border-cvsu-green/10 p-4 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-cvsu-green" />
                    <h3 className="font-medium text-cvsu-dark">{a.title}</h3>
                    <Badge
                      variant="secondary"
                      className={
                        a.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : a.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                      }
                    >
                      {a.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-cvsu-green/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {a.date}
                    </span>
                    <span>{a.audience}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => { setSelected(a); setCreateOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500"
                    onClick={() => { setSelected(a); setDeleteOpen(true); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create announcement</DialogTitle>
            <DialogDescription>Send an announcement to alumni</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Announcement title" className="border-cvsu-green/20" />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea placeholder="Write your announcement..." className="border-cvsu-green/20" rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Input type="date" className="border-cvsu-green/20" />
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <select className="flex h-10 w-full rounded-lg border border-cvsu-green/20 bg-white px-3 py-2 text-sm text-cvsu-dark">
                  <option>All alumni</option>
                  <option>By batch</option>
                  <option>By course</option>
                  <option>By location</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={sendEmail} onChange={() => setSendEmail(!sendEmail)} className="rounded" />
              <span className="text-cvsu-dark">Also send as email blast</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green">
              <Send className="h-4 w-4" />
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(false)}>Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
