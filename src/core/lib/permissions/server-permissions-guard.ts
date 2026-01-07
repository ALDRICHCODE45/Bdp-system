// src/core/lib/permissions/server-permission-guard.ts

import { auth } from "@/core/lib/auth/auth";
import { hasPermission } from "./permission-checker";
import { PermissionError } from "@/core/shared/errors/domain";

/**
 * Verifica si el usuario tiene un permiso específico
 * Lanza un error si no tiene el permiso
 */
export async function requirePermission(
  permission: string,
  errorMessage?: string
): Promise<void> {
  const session = await auth();

  if (!session?.user) {
    throw new PermissionError("No autenticado", "auth:required");
  }

  const userPermissions = session.user.permissions || [];

  if (!hasPermission(userPermissions, permission)) {
    throw new PermissionError(
      errorMessage ||
        `No tienes permiso para realizar esta acción: ${permission}`,
      permission
    );
  }
}

/**
 * Verifica si el usuario tiene al menos uno de los permisos
 */
export async function requireAnyPermission(
  permissions: string[],
  errorMessage?: string
): Promise<void> {
  const session = await auth();

  if (!session?.user) {
    throw new PermissionError("No autenticado", "auth:required");
  }

  const userPermissions = session.user.permissions || [];

  const hasAny = permissions.some((permission) =>
    hasPermission(userPermissions, permission)
  );

  if (!hasAny) {
    throw new PermissionError(
      errorMessage || `No tienes permiso para realizar esta acción`,
      permissions.join("|")
    );
  }
}

/**
 * Obtiene los permisos del usuario actual
 */
export async function getUserPermissions(): Promise<string[]> {
  const session = await auth();
  return session?.user?.permissions || [];
}

/**
 * Verifica permisos sin lanzar error (retorna boolean)
 */
export async function checkPermission(permission: string): Promise<boolean> {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  const userPermissions = session.user.permissions || [];
  return hasPermission(userPermissions, permission);
}
