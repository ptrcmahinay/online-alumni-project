import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";
import type { Profile } from "@/lib/database.types";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "alumni">("alumni");
  const [editBatch, setEditBatch] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteProfile, setDeleteProfile] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProfiles(data);
    setLoading(false);
  }

  const filtered = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.course?.toLowerCase().includes(search.toLowerCase()) ||
      p.batch?.toLowerCase().includes(search.toLowerCase()),
  );

  function openEdit(p: Profile) {
    setEditProfile(p);
    setEditName(p.full_name);
    setEditRole(p.role);
    setEditBatch(p.batch ?? "");
    setEditCourse(p.course ?? "");
  }

  async function handleSave() {
    if (!editProfile) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({
        full_name: editName,
        role: editRole,
        batch: editBatch || null,
        course: editCourse || null,
      })
      .eq("id", editProfile.id);

    setSaving(false);
    setEditProfile(null);
    loadProfiles();
  }

  async function handleDelete() {
    if (!deleteProfile) return;
    setDeleting(true);

    await supabase.from("profiles").delete().eq("id", deleteProfile.id);

    setDeleting(false);
    setDeleteProfile(null);
    loadProfiles();
  }

  const initials = (name: string) =>
    name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "?";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-cvsu-dark">
          Users
        </h1>
        <p className="mt-1 text-sm text-cvsu-green/60">
          Manage alumni and admin accounts
        </p>
      </div>

      <Card className="border-cvsu-green/10 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-base text-cvsu-dark">
            All users
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/50" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-cvsu-green/20 bg-white pl-8 focus-visible:border-cvsu-green"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-cvsu-green" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-cvsu-green/50">
              <Users className="h-4 w-4" />
              {search ? "No users match your search" : "No users yet"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="flex items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarFallback className="bg-cvsu-dark text-xs text-white">
                          {initials(p.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-cvsu-dark">
                        {p.full_name || "Unnamed"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.role === "admin"
                            ? "bg-cvsu-green/20 text-cvsu-dark"
                            : "bg-cvsu-green/10 text-cvsu-green"
                        }`}
                      >
                        {p.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-cvsu-green/70">
                      {p.batch || "—"}
                    </TableCell>
                    <TableCell className="text-cvsu-green/70">
                      {p.course || "—"}
                    </TableCell>
                    <TableCell className="text-cvsu-green/70">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4 text-cvsu-green/50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteProfile(p)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog
        open={!!editProfile}
        onOpenChange={(open) => !open && setEditProfile(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update profile details for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border-cvsu-green/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as "admin" | "alumni")}
              >
                <SelectTrigger className="border-cvsu-green/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alumni">Alumni</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch">Batch year</Label>
                <Input
                  id="batch"
                  value={editBatch}
                  onChange={(e) => setEditBatch(e.target.value)}
                  placeholder="e.g. 2024"
                  className="border-cvsu-green/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  placeholder="e.g. BSIT"
                  className="border-cvsu-green/20"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditProfile(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-cvsu-dark text-white hover:bg-cvsu-green"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteProfile}
        onOpenChange={(open) => !open && setDeleteProfile(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-cvsu-dark">
                {deleteProfile?.full_name || "this user"}
              </span>{" "}
              and their profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
