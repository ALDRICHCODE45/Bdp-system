// src/core/shared/components/PermissionButton.tsx

"use client";

import { ReactNode } from "react";
import { Button, ButtonProps } from "@/core/shared/ui/button";
import { PermissionGuard } from "./PermissionGuard";

interface PermissionButtonProps extends ButtonProps {
  permission?: string;
  permissions?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Botón que solo se muestra si el usuario tiene el permiso requerido
 */
export function PermissionButton({
  permission,
  permissions,
  children,
  fallback = null,
  ...buttonProps
}: PermissionButtonProps) {
  return (
    <PermissionGuard
      permission={permission}
      permissions={permissions}
      fallback={fallback}
    >
      <Button {...buttonProps}>{children}</Button>
    </PermissionGuard>
  );
}
