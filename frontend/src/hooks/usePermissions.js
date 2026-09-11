import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/core/authorization";

export function usePermissions() {

  const { role } = useAuth();

  return {
    role,
    canManageLessons: hasPermission(role, "manageLessons"),
    canStartLive: hasPermission(role, "startLive"),
    canUploadFiles: hasPermission(role, "uploadFiles"),
  };
}