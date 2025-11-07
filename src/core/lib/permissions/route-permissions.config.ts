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

export const ROUTE_PERMISSIONS: Record<string, string> = {
  // Módulo de Finanzas
  "/facturas": "facturas:acceder",
  "/ingresos": "ingresos:acceder",
  "/egresos": "egresos:acceder",
  "/clientes-proovedores": "clientes-proovedores:acceder",

  // Módulo de Recursos Humanos
  "/colaboradores": "colaboradores:acceder",

  // Módulo de Recepción
  "/entradas-salidas": "recepcion:acceder",

  // Módulo de Sistema
  "/usuarios": "usuarios:acceder",
  "/config": "roles:acceder", // La configuración requiere acceso a roles
  "/config/permisos": "roles:acceder",
  "/config/usuarios": "usuarios:acceder",
  "/config/general": "roles:acceder",
  "/config/notificaciones": "roles:acceder",
};

/**
 * Obtiene el permiso requerido para una ruta específica
 * 
 * @param pathname - La ruta a verificar (ej: "/facturas")
 * @returns El permiso requerido o null si la ruta no requiere permisos específicos
 */
export function getRequiredPermission(pathname: string): string | null {
  // Buscar coincidencia exacta primero
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Buscar coincidencia parcial para rutas anidadas
  // Ejemplo: "/facturas/123" debería requerir "facturas:acceder"
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

