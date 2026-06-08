import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Mail, Smartphone } from "lucide-react";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
  const [sendOpen, setSendOpen] = useState(false);
const [history, setHistory] = useState<any[]>([]);
useEffect(() => {
  supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20).then(({ data }) => {
    if (data) setHistory(data.map(n => ({ id: n.id, type: n.type, title: n.title, audience: "All", sent: new Date(n.created_at).toLocaleDateString(), opens: "—", clicks: "—" })));
  });
}, []);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cvsu-dark">Notification Center</h1>
          <p className="mt-1 text-sm text-cvsu-green/60">Send notifications and manage templates</p>
        </div>
        <Button
          onClick={() => setSendOpen(true)}
          className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green"
        >
          <Send className="h-4 w-4" />
          Send notification
        </Button>
      </div>

      <Tabs defaultValue="history">
        <TabsList className="border-cvsu-green/10 bg-white">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4 space-y-4">
          {history.map((h) => (
            <Card key={h.id} className="border-cvsu-green/10 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {h.type === "email" ? (
                      <Mail className="mt-0.5 h-4 w-4 text-blue-500" />
                    ) : (
                      <Smartphone className="mt-0.5 h-4 w-4 text-emerald-500" />
                    )}
                    <div>
                      <h3 className="font-medium text-cvsu-dark">{h.title}</h3>
                      <div className="text-xs text-cvsu-green/60">
                        To: {h.audience} · Sent {h.sent}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-cvsu-green/50 shrink-0">
                    <span>Opens: {h.opens}</span>
                    <span>Clicks: {h.clicks}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-cvsu-dark">Email Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Welcome Email", subject: "Welcome to CvSU Naic Alumni Portal" },
                { name: "Event Reminder", subject: "Reminder: {{event_name}} is coming up" },
                { name: "Job Alert", subject: "New job opportunity: {{job_title}}" },
              ].map((t) => (
                <div key={t.name} className="flex items-center justify-between rounded-lg border border-cvsu-green/10 p-3">
                  <div>
                    <div className="text-sm font-medium text-cvsu-dark">{t.name}</div>
                    <div className="text-xs text-cvsu-green/60">{t.subject}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-cvsu-green">
                    Edit
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <Card className="border-cvsu-green/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-cvsu-dark">System Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "New Registration Alert", desc: "Notify admin when new alumni registers" },
                { label: "Job Post Alert", desc: "Notify admin when a job is posted for review" },
                { label: "Event RSVP Alert", desc: "Notify admin when alumni RSVP to events" },
                { label: "Donation Alert", desc: "Notify admin when a donation is received" },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-cvsu-dark">{p.label}</div>
                    <div className="text-xs text-cvsu-green/60">{p.desc}</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send notification</DialogTitle>
            <DialogDescription>Send an email or push notification to alumni</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <select className="flex h-10 w-full rounded-lg border border-cvsu-green/20 bg-white px-3 py-2 text-sm text-cvsu-dark">
                <option>Email notification</option>
                <option>Push notification</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Target audience</Label>
              <select className="flex h-10 w-full rounded-lg border border-cvsu-green/20 bg-white px-3 py-2 text-sm text-cvsu-dark">
                <option>All alumni</option>
                <option>By batch</option>
                <option>By course</option>
                <option>By location</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Notification title" className="border-cvsu-green/20" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Write your message..." className="border-cvsu-green/20" rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSendOpen(false)}>Cancel</Button>
            <Button className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
