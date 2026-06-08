import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesContextType {
  isDirty: boolean;
  setDirty: (d: boolean) => void;
  pendingNav: (() => void) | null;
  requestNav: (cb: () => void) => void;
  clearNav: () => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(null);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [isDirty, setDirty] = useState(false);
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);

  const requestNav = useCallback((cb: () => void) => setPendingNav(() => cb), []);
  const clearNav = useCallback(() => setPendingNav(null), []);

  return (
    <UnsavedChangesContext.Provider value={{ isDirty, setDirty, pendingNav, requestNav, clearNav }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) throw new Error("useUnsavedChanges must be used within UnsavedChangesProvider");
  return ctx;
}

export function UnsavedChangesDialog({
  onSave,
  onDiscard,
}: {
  onSave: () => Promise<void>;
  onDiscard: () => void;
}) {
  const { pendingNav, clearNav } = useUnsavedChanges();
  const [saving, setSaving] = useState(false);

  if (!pendingNav) return null;

  async function handleSave() {
    setSaving(true);
    await onSave();
    setSaving(false);
    clearNav();
    pendingNav?.();
  }

  function handleDiscard() {
    onDiscard();
    clearNav();
    pendingNav?.();
  }

  function handleCancel() {
    clearNav();
  }

  return (
    <AlertDialog open={!!pendingNav}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes to your profile. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleDiscard}>
            Discard
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-cvsu-dark text-white hover:bg-cvsu-green"
          >
            {saving ? "Saving..." : "Save & leave"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
