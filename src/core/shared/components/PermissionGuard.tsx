"use client";

import { usePermissions } from "@/core/shared/hooks/use-permissions";
import { ReactNode } from "react";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

/**
 * Componente que protege contenido basado en permisos del usuario
 *
 * @param permission - Permiso único requerido
 * @param permissions - Array de permisos (si requireAll es true, necesita todos; si es false, necesita al menos uno)
 * @param requireAll - Si es true, requiere todos los permisos; si es false, requiere al menos uno (default: false)
 * @param fallback - Componente a mostrar si no tiene permisos
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  fallback,
  requireAll = false,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, isAdmin } = usePermissions();

  // Si es admin, tiene acceso a todo
  if (isAdmin) {
    return <>{children}</>;
  }

  // Verificar permiso único
  if (permission) {
    if (hasPermission(permission)) {
      return <>{children}</>;
    }
    return <>{fallback || null}</>;
  }

  // Verificar múltiples permisos
  if (permissions && permissions.length > 0) {
    if (requireAll) {
      // Requiere todos los permisos
      const hasAll = permissions.every((p) => hasPermission(p));
      if (hasAll) {
        return <>{children}</>;
      }
    } else {
      // Requiere al menos uno
      if (hasAnyPermission(permissions)) {
        return <>{children}</>;
      }
    }
    return <>{fallback || null}</>;
  }

  // Si no se especifican permisos, mostrar contenido (por seguridad, mejor no mostrar nada)
  return <>{fallback || null}</>;
}
