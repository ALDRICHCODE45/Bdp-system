import { ROUTE_PERMISSIONS } from "./route-permissions.config";
import { hasPermission } from "./permission-checker";

/**
 * Orden de prioridad de las rutas para redirección por defecto
 * Las rutas se evaluarán en este orden para determinar la ruta por defecto
 */
const ROUTE_PRIORITY = [
  "/facturas",
  "/ingresos",
  "/egresos",
  "/colaboradores",
  "/entradas-salidas",
  "/usuarios",
  "/config",
  "/clientes-proovedores",
] as const;

/**
 * Ruta por defecto para administradores
 */
const DEFAULT_ADMIN_ROUTE = "/facturas";

/**
 * Ruta de fallback si el usuario no tiene acceso a ninguna ruta
 */
const FALLBACK_ROUTE = "/access-denied";

/**
 * Obtiene la ruta por defecto basada en los permisos del usuario
 * 
 * @param userPermissions - Array de permisos del usuario
 * @returns La ruta por defecto a la que debe ser redirigido el usuario
 * 
 * @example
 * // Usuario admin
 * getDefaultRoute(["admin:all"]) // "/facturas"
 * 
 * // Usuario con permiso de facturas
 * getDefaultRoute(["facturas:acceder"]) // "/facturas"
 * 
 * // Usuario con permiso de RH
 * getDefaultRoute(["colaboradores:acceder"]) // "/colaboradores"
 * 
 * // Usuario sin permisos
 * getDefaultRoute([]) // "/access-denied"
 */
export function getDefaultRoute(userPermissions: string[]): string {
  // Si el usuario es admin, redirigir a la ruta por defecto de admin
  if (userPermissions.includes("admin:all")) {
    return DEFAULT_ADMIN_ROUTE;
  }

  // Si no tiene permisos, redirigir a acceso denegado
  if (!userPermissions || userPermissions.length === 0) {
    return FALLBACK_ROUTE;
  }

  // Iterar sobre las rutas en orden de prioridad
  for (const route of ROUTE_PRIORITY) {
    // Obtener el permiso requerido para esta ruta
    const requiredPermission = ROUTE_PERMISSIONS[route];

    // Si la ruta no requiere permisos específicos, continuar
    if (!requiredPermission) {
      continue;
    }

    // Verificar si el usuario tiene el permiso requerido
    if (hasPermission(userPermissions, requiredPermission)) {
      return route;
    }
  }

  // Si no se encontró ninguna ruta accesible, buscar en todas las rutas configuradas
  // (por si hay rutas que no están en la lista de prioridad)
  for (const [route, requiredPermission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (hasPermission(userPermissions, requiredPermission)) {
      return route;
    }
  }

  // Si no tiene acceso a ninguna ruta, redirigir a acceso denegado
  return FALLBACK_ROUTE;
}

