"use client";

import { useSession } from "next-auth/react";
import {
  hasPermission,
  hasAnyPermission,
} from "@/core/lib/permissions/permission-checker";

export function usePermissions() {
  const { data: session } = useSession();
  const userPermissions = session?.user?.permissions || [];

  const checkPermission = (permission: string): boolean => {
    return hasPermission(userPermissions, permission);
  };

  const checkAnyPermission = (permissions: string[]): boolean => {
    return hasAnyPermission(userPermissions, permissions);
  };

  return {
    permissions: userPermissions,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    isAdmin: checkPermission("admin:all"),
  };
}
