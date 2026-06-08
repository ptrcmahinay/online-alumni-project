import { Outlet, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { UnsavedChangesProvider } from "@/lib/unsaved-changes";

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <UnsavedChangesProvider>
        <Outlet />
      </UnsavedChangesProvider>
    </AuthProvider>
  ),
});
