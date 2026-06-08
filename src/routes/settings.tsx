import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings2,
  Shield,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [notifications, setNotifications] = useState({
    email_announcements: true,
    email_events: true,
    email_jobs: true,
    email_reminders: true,
    push_announcements: false,
    push_events: true,
    push_jobs: false,
    push_reminders: true,
  });

  function toggle(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-cvsu-dark">Settings</h1>
          <p className="mt-1 text-sm text-cvsu-green/60">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="border-cvsu-green/10 bg-white">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Account */}
          <TabsContent value="account" className="space-y-6">
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                  <Settings2 className="h-4 w-4 text-cvsu-green" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display name</Label>
                    <Input id="display-name" className="border-cvsu-green/20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display-email">Email</Label>
                    <Input id="display-email" type="email" className="border-cvsu-green/20" />
                  </div>
                </div>
            <Button className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green">
              Save changes
            </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-red-600">
                  <Trash2 className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cvsu-green/60">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" className="mt-3 gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                  <Shield className="h-4 w-4 text-cvsu-green" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrent ? "text" : "password"}
                      className="border-cvsu-green/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cvsu-green/40"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        className="border-cvsu-green/20 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cvsu-green/40"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="border-cvsu-green/20"
                    />
                  </div>
                </div>
                <Button className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green">
                  <Shield className="h-4 w-4" />
                  Update password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-cvsu-green/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                  <Mail className="h-4 w-4 text-cvsu-green" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "email_announcements" as const, label: "Announcements", desc: "School updates and alumni announcements" },
                  { key: "email_events" as const, label: "Events", desc: "Upcoming alumni events and meetups" },
                  { key: "email_jobs" as const, label: "Job opportunities", desc: "New job postings from the referral board" },
                  { key: "email_reminders" as const, label: "Reminders", desc: "Event reminders and important dates" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-cvsu-dark">{item.label}</div>
                      <div className="text-xs text-cvsu-green/60">{item.desc}</div>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={() => toggle(item.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-cvsu-green/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-cvsu-dark">
                  <Smartphone className="h-4 w-4 text-cvsu-green" />
                  Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "push_announcements" as const, label: "Announcements", desc: "Push alerts for announcements" },
                  { key: "push_events" as const, label: "Events", desc: "Push alerts for events" },
                  { key: "push_jobs" as const, label: "Job opportunities", desc: "Push alerts for new jobs" },
                  { key: "push_reminders" as const, label: "Reminders", desc: "Push alerts for reminders" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-cvsu-dark">{item.label}</div>
                      <div className="text-xs text-cvsu-green/60">{item.desc}</div>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={() => toggle(item.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
