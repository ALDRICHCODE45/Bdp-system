/**
 * Guard para verificación de permisos en rutas
 *
 * Este guard centraliza la lógica de verificación de permisos para rutas,
 * implementando un patrón Strategy para diferentes tipos de verificación.
 */

import {
  getRequiredPermission,
  requiresPermission,
} from "./route-permissions.config";
import { MiddlewarePermissionsService } from "./middleware-permissions.service";

/**
 * Tipo para el objeto de autenticación del middleware
 */
type AuthRequest = unknown;

/**
 * Resultado de la verificación de acceso
 */
type AccessCheckResult = {
  hasAccess: boolean;
  reason?: string;
  requiredPermission?: string;
};

/**
 * Guard para verificar permisos de rutas en el middleware
 */
export class RoutePermissionGuard {
  /**
   * Verifica si el usuario puede acceder a una ruta específica
   *
   * @param auth - Objeto de autenticación de NextAuth (req.auth)
   * @param pathname - Ruta que se está verificando
   * @returns Resultado de la verificación de acceso
   */
  static canAccessRoute(
    auth: AuthRequest,
    pathname: string,
  ): AccessCheckResult {
    // Si no hay autenticación, no tiene acceso
    if (!auth) {
      return {
        hasAccess: false,
        reason: "No autenticado",
      };
    }

    // Extraer permisos del usuario
    const userPermissions =
      MiddlewarePermissionsService.extractPermissions(auth);

    // Verificar si tiene permiso de administrador (bypass total)
    if (MiddlewarePermissionsService.hasAdminPermission(userPermissions)) {
      return {
        hasAccess: true,
        reason: "Usuario administrador",
      };
    }

    // Verificar si la ruta requiere permisos
    if (!requiresPermission(pathname)) {
      // Ruta no requiere permisos específicos, permitir acceso
      return {
        hasAccess: true,
        reason: "Ruta pública",
      };
    }

    // Obtener permiso requerido para la ruta
    const requiredPermission = getRequiredPermission(pathname);

    if (!requiredPermission) {
      // Ruta no tiene permiso requerido configurado
      // Por seguridad, denegar acceso
      return {
        hasAccess: false,
        reason: "Permiso requerido no configurado",
        requiredPermission: undefined,
      };
    }

    // Verificar si el usuario tiene el permiso requerido
    const hasPermission = MiddlewarePermissionsService.hasRequiredPermission(
      userPermissions,
      requiredPermission,
    );

    // Logging en desarrollo
    MiddlewarePermissionsService.logPermissionCheck(
      auth,
      pathname,
      hasPermission,
    );

    return {
      hasAccess: hasPermission,
      reason: hasPermission ? "Permiso verificado" : "Permiso insuficiente",
      requiredPermission,
    };
  }

  /**
   * Verifica acceso de forma rápida (solo retorna boolean)
   * Útil cuando no necesitas detalles del resultado
   *
   * @param auth - Objeto de autenticación
   * @param pathname - Ruta a verificar
   * @returns true si tiene acceso
   */
  static hasAccess(auth: AuthRequest, pathname: string): boolean {
    return this.canAccessRoute(auth, pathname).hasAccess;
  }
}
