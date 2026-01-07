// src/core/lib/permissions/permission-actions.ts

/**
 * Genera los nombres de permisos de forma type-safe
 */
export const PermissionActions = {
  facturas: {
    acceder: "facturas:acceder",
    ver: "facturas:ver",
    crear: "facturas:crear",
    editar: "facturas:editar",
    eliminar: "facturas:eliminar",
    gestionar: "facturas:gestionar",
  },
  ingresos: {
    acceder: "ingresos:acceder",
    ver: "ingresos:ver",
    crear: "ingresos:crear",
    editar: "ingresos:editar",
    eliminar: "ingresos:eliminar",
    gestionar: "ingresos:gestionar",
  },
  egresos: {
    acceder: "egresos:acceder",
    ver: "egresos:ver",
    crear: "egresos:crear",
    editar: "egresos:editar",
    eliminar: "egresos:eliminar",
    gestionar: "egresos:gestionar",
  },
  "clientes-proovedores": {
    acceder: "clientes-proovedores:acceder",
    ver: "clientes-proovedores:ver",
    crear: "clientes-proovedores:crear",
    editar: "clientes-proovedores:editar",
    eliminar: "clientes-proovedores:eliminar",
    gestionar: "clientes-proovedores:gestionar",
  },
  colaboradores: {
    acceder: "colaboradores:acceder",
    ver: "colaboradores:ver",
    crear: "colaboradores:crear",
    editar: "colaboradores:editar",
    eliminar: "colaboradores:eliminar",
    "ver-historial": "colaboradores:ver-historial",
    gestionar: "colaboradores:gestionar",
  },
  socios: {
    acceder: "socios:acceder",
    ver: "socios:ver",
    crear: "socios:crear",
    editar: "socios:editar",
    eliminar: "socios:eliminar",
    gestionar: "socios:gestionar",
  },
  asistencias: {
    acceder: "asistencias:acceder",
    ver: "asistencias:ver",
    crear: "asistencias:crear",
    editar: "asistencias:editar",
    eliminar: "asistencias:eliminar",
    gestionar: "asistencias:gestionar",
  },
  recepcion: {
    acceder: "recepcion:acceder",
    ver: "recepcion:ver",
    crear: "recepcion:crear",
    editar: "recepcion:editar",
    eliminar: "recepcion:eliminar",
    gestionar: "recepcion:gestionar",
  },
  usuarios: {
    acceder: "usuarios:acceder",
    ver: "usuarios:ver",
    crear: "usuarios:crear",
    editar: "usuarios:editar",
    eliminar: "usuarios:eliminar",
    "asignar-roles": "usuarios:asignar-roles",
    gestionar: "usuarios:gestionar",
  },
  roles: {
    acceder: "roles:acceder",
    ver: "roles:ver",
    crear: "roles:crear",
    editar: "roles:editar",
    eliminar: "roles:eliminar",
    "asignar-permisos": "roles:asignar-permisos",
    gestionar: "roles:gestionar",
  },
  permisos: {
    ver: "permisos:ver",
  },
} as const;

/**
 * Helper para obtener permisos de un recurso de forma type-safe
 */
export function getResourcePermissions(
  resource: keyof typeof PermissionActions
) {
  return PermissionActions[resource];
}
