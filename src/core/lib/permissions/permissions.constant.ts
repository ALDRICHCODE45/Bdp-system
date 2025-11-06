/**
 * Sistema de permisos predefinidos del sistema
 * Formato híbrido: granular (recurso:acción) y modular (recurso:gestionar)
 */

export type PermissionDefinition = {
  name: string;
  resource: string;
  action: string;
  description: string;
};

/**
 * Permisos del módulo de Finanzas
 */
const FINANZAS_PERMISSIONS: PermissionDefinition[] = [
  // Facturas - Granulares
  {
    name: "facturas:acceder",
    resource: "facturas",
    action: "acceder",
    description: "Acceder al módulo de facturas",
  },
  {
    name: "facturas:ver",
    resource: "facturas",
    action: "ver",
    description: "Ver listado de facturas",
  },
  {
    name: "facturas:crear",
    resource: "facturas",
    action: "crear",
    description: "Crear nuevas facturas",
  },
  {
    name: "facturas:editar",
    resource: "facturas",
    action: "editar",
    description: "Editar facturas existentes",
  },
  {
    name: "facturas:eliminar",
    resource: "facturas",
    action: "eliminar",
    description: "Eliminar facturas",
  },
  // Facturas - Modular
  {
    name: "facturas:gestionar",
    resource: "facturas",
    action: "gestionar",
    description:
      "Gestionar completamente el módulo de facturas (incluye todas las acciones)",
  },

  // Ingresos - Granulares
  {
    name: "ingresos:acceder",
    resource: "ingresos",
    action: "acceder",
    description: "Acceder al módulo de ingresos",
  },
  {
    name: "ingresos:ver",
    resource: "ingresos",
    action: "ver",
    description: "Ver listado de ingresos",
  },
  {
    name: "ingresos:crear",
    resource: "ingresos",
    action: "crear",
    description: "Crear nuevos ingresos",
  },
  {
    name: "ingresos:editar",
    resource: "ingresos",
    action: "editar",
    description: "Editar ingresos existentes",
  },
  {
    name: "ingresos:eliminar",
    resource: "ingresos",
    action: "eliminar",
    description: "Eliminar ingresos",
  },
  // Ingresos - Modular
  {
    name: "ingresos:gestionar",
    resource: "ingresos",
    action: "gestionar",
    description:
      "Gestionar completamente el módulo de ingresos (incluye todas las acciones)",
  },

  // Egresos - Granulares
  {
    name: "egresos:acceder",
    resource: "egresos",
    action: "acceder",
    description: "Acceder al módulo de egresos",
  },
  {
    name: "egresos:ver",
    resource: "egresos",
    action: "ver",
    description: "Ver listado de egresos",
  },
  {
    name: "egresos:crear",
    resource: "egresos",
    action: "crear",
    description: "Crear nuevos egresos",
  },
  {
    name: "egresos:editar",
    resource: "egresos",
    action: "editar",
    description: "Editar egresos existentes",
  },
  {
    name: "egresos:eliminar",
    resource: "egresos",
    action: "eliminar",
    description: "Eliminar egresos",
  },
  // Egresos - Modular
  {
    name: "egresos:gestionar",
    resource: "egresos",
    action: "gestionar",
    description:
      "Gestionar completamente el módulo de egresos (incluye todas las acciones)",
  },

  // Clientes/Proveedores - Granulares
  {
    name: "clientes-proovedores:acceder",
    resource: "clientes-proovedores",
    action: "acceder",
    description: "Acceder al módulo de clientes y proveedores",
  },
  {
    name: "clientes-proovedores:ver",
    resource: "clientes-proovedores",
    action: "ver",
    description: "Ver listado de clientes y proveedores",
  },
  {
    name: "clientes-proovedores:crear",
    resource: "clientes-proovedores",
    action: "crear",
    description: "Crear nuevos clientes o proveedores",
  },
  {
    name: "clientes-proovedores:editar",
    resource: "clientes-proovedores",
    action: "editar",
    description: "Editar clientes o proveedores existentes",
  },
  {
    name: "clientes-proovedores:eliminar",
    resource: "clientes-proovedores",
    action: "eliminar",
    description: "Eliminar clientes o proveedores",
  },
  // Clientes/Proveedores - Modular
  {
    name: "clientes-proovedores:gestionar",
    resource: "clientes-proovedores",
    action: "gestionar",
    description:
      "Gestionar completamente el módulo de clientes y proveedores (incluye todas las acciones)",
  },
];

/**
 * Permisos del módulo de Recursos Humanos
 */
const RH_PERMISSIONS: PermissionDefinition[] = [
  // Colaboradores - Granulares
  {
    name: "colaboradores:acceder",
    resource: "colaboradores",
    action: "acceder",
    description: "Acceder al módulo de colaboradores",
  },
  {
    name: "colaboradores:ver",
    resource: "colaboradores",
    action: "ver",
    description: "Ver listado de colaboradores",
  },
  {
    name: "colaboradores:crear",
    resource: "colaboradores",
    action: "crear",
    description: "Crear nuevos colaboradores",
  },
  {
    name: "colaboradores:editar",
    resource: "colaboradores",
    action: "editar",
    description: "Editar colaboradores existentes",
  },
  {
    name: "colaboradores:eliminar",
    resource: "colaboradores",
    action: "eliminar",
    description: "Eliminar colaboradores",
  },
  // Colaboradores - Modular
  {
    name: "colaboradores:gestionar",
    resource: "colaboradores",
    action: "gestionar",
    description:
      "Gestionar completamente el módulo de colaboradores (incluye todas las acciones)",
  },
];

/**
 * Permisos del módulo de Recepción
 */
const RECEPCION_PERMISSIONS: PermissionDefinition[] = [
  // Entradas y Salidas - Granulares
  {
    name: "recepcion:acceder",
    resource: "recepcion",
    action: "acceder",
    description: "Acceder al módulo de recepción",
  },
  {
    name: "recepcion:ver",
    resource: "recepcion",
    action: "ver",
    description: "Ver entradas y salidas",
  },
  {
    name: "recepcion:crear",
    resource: "recepcion",
    action: "crear",
    description: "Crear nuevas entradas y salidas",
  },
  {
    name: "recepcion:editar",
    resource: "recepcion",
    action: "editar",
    description: "Editar entradas y salidas existentes",
  },
  {
    name: "recepcion:eliminar",
    resource: "recepcion",
    action: "eliminar",
    description: "Eliminar entradas y salidas",
  },
  // Recepción - Modular
  {
    name: "recepcion:gestionar",
    resource: "recepcion",
    action: "gestionar",
    description:
      "Gestionar completamente el módulo de recepción (incluye todas las acciones)",
  },
];

/**
 * Permisos del módulo de Sistema
 */
const SISTEMA_PERMISSIONS: PermissionDefinition[] = [
  // Roles - Granulares
  {
    name: "roles:acceder",
    resource: "roles",
    action: "acceder",
    description: "Acceder al módulo de roles",
  },
  {
    name: "roles:ver",
    resource: "roles",
    action: "ver",
    description: "Ver listado de roles",
  },
  {
    name: "roles:crear",
    resource: "roles",
    action: "crear",
    description: "Crear nuevos roles",
  },
  {
    name: "roles:editar",
    resource: "roles",
    action: "editar",
    description: "Editar roles existentes",
  },
  {
    name: "roles:eliminar",
    resource: "roles",
    action: "eliminar",
    description: "Eliminar roles",
  },
  {
    name: "roles:asignar-permisos",
    resource: "roles",
    action: "asignar-permisos",
    description: "Asignar permisos a roles",
  },
  // Roles - Modular
  {
    name: "roles:gestionar",
    resource: "roles",
    action: "gestionar",
    description:
      "Gestionar completamente el módulo de roles (incluye todas las acciones)",
  },

  // Usuarios - Granulares
  {
    name: "usuarios:acceder",
    resource: "usuarios",
    action: "acceder",
    description: "Acceder al módulo de usuarios",
  },
  {
    name: "usuarios:ver",
    resource: "usuarios",
    action: "ver",
    description: "Ver listado de usuarios",
  },
  {
    name: "usuarios:crear",
    resource: "usuarios",
    action: "crear",
    description: "Crear nuevos usuarios",
  },
  {
    name: "usuarios:editar",
    resource: "usuarios",
    action: "editar",
    description: "Editar usuarios existentes",
  },
  {
    name: "usuarios:eliminar",
    resource: "usuarios",
    action: "eliminar",
    description: "Eliminar usuarios",
  },
  {
    name: "usuarios:asignar-roles",
    resource: "usuarios",
    action: "asignar-roles",
    description: "Asignar roles a usuarios",
  },
  // Usuarios - Modular
  {
    name: "usuarios:gestionar",
    resource: "usuarios",
    action: "gestionar",
    description:
      "Gestionar completamente el módulo de usuarios (incluye todas las acciones)",
  },

  // Permisos - Granulares
  {
    name: "permisos:ver",
    resource: "permisos",
    action: "ver",
    description: "Ver listado de permisos",
  },
];

/**
 * Permiso especial de administrador
 */
const ADMIN_PERMISSION: PermissionDefinition = {
  name: "admin:all",
  resource: "admin",
  action: "all",
  description: "Acceso total al sistema (administrador)",
};

/**
 * Todos los permisos del sistema
 */
export const ALL_PERMISSIONS: PermissionDefinition[] = [
  ...FINANZAS_PERMISSIONS,
  ...RH_PERMISSIONS,
  ...RECEPCION_PERMISSIONS,
  ...SISTEMA_PERMISSIONS,
  ADMIN_PERMISSION,
];

/**
 * Permisos agrupados por módulo
 */
export const PERMISSIONS_BY_MODULE = {
  finanzas: FINANZAS_PERMISSIONS,
  rh: RH_PERMISSIONS,
  recepcion: RECEPCION_PERMISSIONS,
  sistema: SISTEMA_PERMISSIONS,
  admin: [ADMIN_PERMISSION],
};

/**
 * Obtener todos los nombres de permisos
 */
export function getAllPermissionNames(): string[] {
  return ALL_PERMISSIONS.map((p) => p.name);
}

/**
 * Obtener permisos por recurso
 */
export function getPermissionsByResource(
  resource: string
): PermissionDefinition[] {
  return ALL_PERMISSIONS.filter((p) => p.resource === resource);
}

/**
 * Verificar si un permiso es modular (gestionar)
 */
export function isModularPermission(permissionName: string): boolean {
  return (
    permissionName.endsWith(":gestionar") || permissionName === "admin:all"
  );
}

/**
 * Obtener todas las acciones de un recurso (para permisos modulares)
 */
export function getResourceActions(resource: string): string[] {
  const permissions = getPermissionsByResource(resource);
  return permissions
    .filter((p) => p.action !== "gestionar" && p.action !== "acceder")
    .map((p) => p.action);
}
