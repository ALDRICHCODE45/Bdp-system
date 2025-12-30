/**
 * Servicio para extraer y verificar permisos en el middleware de NextAuth v5
 *
 * Este servicio maneja la extracción robusta de permisos del token JWT
 * desde diferentes estructuras posibles de req.auth en NextAuth v5
 */

import { hasPermission } from "./permission-checker";

/**
 * Tipo para representar la estructura de autenticación en el middleware
 * En NextAuth v5, req.auth puede ser la sesión completa o tener diferentes estructuras
 */
type AuthData = {
  user?: {
    id?: string;
    permissions?: string[];
    role?: string;
    email?: string;
    name?: string;
    [key: string]: unknown;
  };
  session?: {
    user?: {
      id?: string;
      permissions?: string[];
      role?: string;
      email?: string;
      name?: string;
      [key: string]: unknown;
    };
    expires?: string;
    [key: string]: unknown;
  };
  token?: {
    permissions?: string[];
    role?: string;
    sub?: string;
    [key: string]: unknown;
  };
  permissions?: string[];
  [key: string]: unknown;
};

/**
 * Servicio para manejar permisos en el middleware
 */
export class MiddlewarePermissionsService {
  /**
   * Extrae los permisos del objeto de autenticación de NextAuth v5
   * Intenta múltiples estrategias para encontrar los permisos
   *
   * En NextAuth v5, req.auth en el middleware puede tener la estructura de la sesión,
   * por lo que los permisos deberían estar en auth.user.permissions
   *
   * @param auth - El objeto req.auth del middleware
   * @returns Array de permisos del usuario
   */
  static extractPermissions(auth: unknown): string[] {
    if (!auth) {
      return [];
    }

    const authData = auth as AuthData;

    // Estrategia 1: auth.user.permissions (estructura más común en NextAuth v5)
    // Esta es la estructura esperada cuando req.auth contiene la sesión
    if (
      authData.user?.permissions &&
      Array.isArray(authData.user.permissions)
    ) {
      return authData.user.permissions;
    }

    // Estrategia 2: Permisos directamente en el objeto auth
    if (Array.isArray(authData.permissions)) {
      return authData.permissions;
    }

    // Estrategia 3: Permisos en auth.session.user.permissions
    if (
      authData.session?.user?.permissions &&
      Array.isArray(authData.session.user.permissions)
    ) {
      return authData.session.user.permissions;
    }

    // Estrategia 4: Permisos en auth.token.permissions (JWT directo)
    if (
      authData.token?.permissions &&
      Array.isArray(authData.token.permissions)
    ) {
      return authData.token.permissions;
    }

    // Estrategia 5: Intentar acceder como objeto plano con propiedad permissions
    if (typeof authData === "object" && authData !== null) {
      const permissions = (authData as Record<string, unknown>).permissions;
      if (Array.isArray(permissions)) {
        return permissions;
      }

      // Estrategia 6: Intentar acceder a través de cualquier propiedad que contenga 'user'
      const keys = Object.keys(authData);
      for (const key of keys) {
        const value = (authData as Record<string, unknown>)[key];
        if (value && typeof value === "object" && "permissions" in value) {
          const perms = (value as { permissions?: unknown }).permissions;
          if (Array.isArray(perms)) {
            return perms;
          }
        }
      }
    }

    // Si no se encuentran permisos, retornar array vacío
    // En desarrollo, loguear para debugging
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[MiddlewarePermissionsService] No se pudieron extraer permisos de:",
        {
          hasAuth: !!auth,
          authKeys: auth && typeof auth === "object" ? Object.keys(auth) : [],
          authStructure:
            auth && typeof auth === "object"
              ? JSON.stringify(auth, null, 2).substring(0, 200)
              : String(auth),
        },
      );
    }

    return [];
  }

  /**
   * Verifica si el usuario tiene permiso de administrador
   *
   * @param permissions - Array de permisos del usuario
   * @returns true si tiene permiso admin:all
   */
  static hasAdminPermission(permissions: string[]): boolean {
    return permissions.includes("admin:all");
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * Incluye verificación de admin:all primero para eficiencia
   *
   * @param permissions - Array de permisos del usuario
   * @param requiredPermission - Permiso requerido
   * @returns true si tiene el permiso
   */
  static hasRequiredPermission(
    permissions: string[],
    requiredPermission: string,
  ): boolean {
    // Verificar admin primero (más rápido)
    if (this.hasAdminPermission(permissions)) {
      return true;
    }

    // Verificar permiso específico usando el checker existente
    return hasPermission(permissions, requiredPermission);
  }

  /**
   * Método de utilidad para logging (solo en desarrollo)
   *
   * @param auth - Objeto de autenticación
   * @param pathname - Ruta que se está verificando
   * @param hasAccess - Si tiene acceso o no
   */
  static logPermissionCheck(
    auth: unknown,
    pathname: string,
    hasAccess: boolean,
  ): void {
    if (process.env.NODE_ENV === "development") {
      const permissions = this.extractPermissions(auth);
      console.log("[Permission Check]", {
        pathname,
        hasAccess,
        permissionsCount: permissions.length,
        hasAdmin: this.hasAdminPermission(permissions),
        permissions: permissions.slice(0, 5), // Solo primeros 5 para no saturar
      });
    }
  }
}
