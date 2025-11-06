import { isModularPermission, getResourceActions } from "./permissions.constant";

/**
 * Verifica si un usuario tiene un permiso específico
 * Soporta permisos modulares: si tiene "recurso:gestionar", tiene todas las acciones de ese recurso
 * También soporta "admin:all" que da acceso a todo
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  // Si el usuario tiene el permiso de administrador, tiene acceso a todo
  if (userPermissions.includes("admin:all")) {
    return true;
  }

  // Si tiene el permiso exacto, tiene acceso
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Verificar si tiene un permiso modular que incluya la acción requerida
  const [resource, action] = requiredPermission.split(":");

  if (!resource || !action) {
    return false;
  }

  // Si tiene el permiso modular "recurso:gestionar", tiene todas las acciones
  const modularPermission = `${resource}:gestionar`;
  if (userPermissions.includes(modularPermission)) {
    return true;
  }

  return false;
}

/**
 * Verifica si un usuario tiene al menos uno de los permisos requeridos
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((permission) =>
    hasPermission(userPermissions, permission)
  );
}

/**
 * Verifica si un usuario tiene todos los permisos requeridos
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((permission) =>
    hasPermission(userPermissions, permission)
  );
}

/**
 * Obtiene todos los permisos efectivos de un usuario
 * Si tiene un permiso modular, expande todas las acciones incluidas
 */
export function getEffectivePermissions(userPermissions: string[]): string[] {
  const effective: string[] = [...userPermissions];

  // Si tiene admin:all, retornar todos los permisos posibles
  if (userPermissions.includes("admin:all")) {
    return userPermissions; // O podrías expandir todos los permisos aquí
  }

  // Para cada permiso modular, agregar las acciones individuales
  userPermissions.forEach((permission) => {
    if (isModularPermission(permission) && permission !== "admin:all") {
      const [resource] = permission.split(":");
      if (resource) {
        const actions = getResourceActions(resource);
        actions.forEach((action) => {
          const individualPermission = `${resource}:${action}`;
          if (!effective.includes(individualPermission)) {
            effective.push(individualPermission);
          }
        });
      }
    }
  });

  return effective;
}

