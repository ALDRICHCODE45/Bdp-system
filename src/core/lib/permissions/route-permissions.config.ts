/**
 * Mapeo de rutas a permisos requeridos
 *
 * Este archivo centraliza la configuración de qué permisos se requieren
 * para acceder a cada ruta del sistema.
 *
 * Formato: ruta -> permiso requerido
 *
 * Notas:
 * - Las rutas deben comenzar con "/"
 * - Los permisos deben seguir el formato "recurso:acción"
 * - Para rutas anidadas, usar el permiso del recurso principal
 */

export const ROUTE_PERMISSIONS: Record<string, string | string[]> = {
  // Módulo de Finanzas
  "/facturas": ["facturas:acceder", "facturas:capturar"],
  "/ingresos": "ingresos:acceder",
  "/egresos": "egresos:acceder",
  "/clientes-proovedores": "clientes-proovedores:acceder",

  // Módulo de Recursos Humanos
  "/colaboradores": "colaboradores:acceder",
  "/socios": "socios:acceder",
  "/asistencias": "asistencias:acceder",

  // Módulo de Recepción
  "/entradas-salidas": "recepcion:acceder",
  "/qr-entry": "recepcion:acceder",
  "/register-qr-entry": "recepcion:acceder",

  // Módulo de Sistema
  "/usuarios": "usuarios:acceder",
  "/config": "roles:acceder", // La configuración requiere acceso a roles
  "/config/permisos": "roles:acceder",
  "/config/usuarios": "usuarios:acceder",
  "/config/general": "roles:acceder",
  "/config/notificaciones": "roles:acceder",
};

/**
 * Obtiene el permiso requerido para una ruta específica.
 * Puede retornar un string simple o un array de strings (ANY of them grants access).
 *
 * @param pathname - La ruta a verificar (ej: "/facturas")
 * @returns El permiso (o array de permisos) requerido, o null si la ruta no requiere permisos
 */
export function getRequiredPermission(
  pathname: string,
): string | string[] | null {
  // Buscar coincidencia exacta primero
  if (ROUTE_PERMISSIONS[pathname] !== undefined) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Buscar coincidencia parcial para rutas anidadas
  // Ejemplo: "/facturas/123" debería requerir el permiso de "facturas"
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find((route) => {
    // Si la ruta configurada termina con "/", permitir subrutas
    if (route.endsWith("/")) {
      return pathname.startsWith(route);
    }
    // Si no termina con "/", solo coincidencias exactas o que comiencen con la ruta + "/"
    return pathname.startsWith(route + "/") || pathname === route;
  });

  return matchingRoute ? ROUTE_PERMISSIONS[matchingRoute] : null;
}

/**
 * Verifica si una ruta requiere protección por permisos
 *
 * @param pathname - La ruta a verificar
 * @returns true si la ruta requiere verificación de permisos
 */
export function requiresPermission(pathname: string): boolean {
  return getRequiredPermission(pathname) !== null;
}
