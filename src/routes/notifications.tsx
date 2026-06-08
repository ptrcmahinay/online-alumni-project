import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Notification } from "@/lib/database.types";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Calendar,
  Briefcase,
  Megaphone,
  CheckCheck,
  Clock,
  Trash2,
} from "lucide-react";

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  announcement: { icon: Megaphone, color: "text-amber-500 bg-amber-100" },
  event: { icon: Calendar, color: "text-blue-500 bg-blue-100" },
  job: { icon: Briefcase, color: "text-emerald-500 bg-emerald-100" },
  system: { icon: Bell, color: "text-purple-500 bg-purple-100" },
};

const defaultConfig = { icon: Bell, color: "text-cvsu-green/60 bg-cvsu-green/10" };

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function NotificationsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setNotifications(data);
        setLoading(false);
      });
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = tab === "all" ? notifications : notifications.filter((n) => !n.read);

  async function markAllRead() {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function deleteNotification(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-cvsu-dark">Notifications</h1>
            <p className="mt-1 text-sm text-cvsu-green/60">
              Stay updated with events, jobs, and announcements
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="gap-1.5 text-cvsu-green"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="border-cvsu-green/10 bg-white">
            <TabsTrigger value="all">
              All
              <span className="ml-1.5 rounded-full bg-cvsu-green/20 px-1.5 py-0.5 text-xs text-cvsu-dark">
                {notifications.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              <span className="ml-1.5 rounded-full bg-cvsu-green px-1.5 py-0.5 text-xs text-cvsu-dark">
                {unreadCount}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4 space-y-2">
            {loading ? (
              <Card className="border-cvsu-green/10 shadow-sm">
                <CardContent className="flex flex-col items-center py-12">
                  <Bell className="h-12 w-12 text-cvsu-green/30 animate-pulse" />
                  <h3 className="mt-4 font-medium text-cvsu-dark">Loading notifications...</h3>
                </CardContent>
              </Card>
            ) : filtered.length === 0 ? (
              <Card className="border-cvsu-green/10 shadow-sm">
                <CardContent className="flex flex-col items-center py-12">
                  <Bell className="h-12 w-12 text-cvsu-green/30" />
                  <h3 className="mt-4 font-medium text-cvsu-dark">All caught up!</h3>
                  <p className="mt-1 text-sm text-cvsu-green/60">No notifications to show.</p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((n) => {
                const { icon: Icon, color } = typeConfig[n.type] ?? defaultConfig;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 rounded-lg border p-4 transition hover:shadow-sm ${
                      !n.read
                        ? "border-cvsu-green/20 bg-cvsu-green/5"
                        : "border-cvsu-green/10 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium text-cvsu-dark">{n.title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                          {!n.read && <div className="h-2 w-2 rounded-full bg-cvsu-green" />}
                          <span className="flex items-center gap-1 text-xs text-cvsu-green/40">
                            <Clock className="h-3 w-3" />
                            {formatTime(n.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-cvsu-green/70">{n.message}</p>
                    </div>
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="shrink-0 rounded p-1 text-cvsu-green/30 transition hover:text-red-500"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
