import { LucideIcon } from "lucide-react";
import { getRequiredPermission } from "@/core/lib/permissions/route-permissions.config";
import { hasPermission } from "@/core/lib/permissions/permission-checker";

/**
 * Tipo para los items del sidebar
 */
export type SidebarItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: {
    title: string;
    url: string;
  }[];
};

/**
 * Filtra los links del sidebar basándose en los permisos del usuario
 *
 * @param links - Array de items del sidebar a filtrar
 * @param userPermissions - Array de permisos del usuario
 * @returns Array de items filtrados (solo los que el usuario puede ver)
 */
export function filterSidebarLinks(
  links: SidebarItem[],
  userPermissions: string[]
): SidebarItem[] {
  // Si el usuario es admin, mostrar todos los links
  if (userPermissions.includes("admin:all")) {
    return links;
  }

  // Filtrar cada módulo
  const filteredModules: SidebarItem[] = [];

  for (const modulo of links) {
    // Filtrar los items (subitems) del módulo
    const filteredItems = modulo.items?.filter((item) => {
      // Obtener el permiso requerido para esta ruta
      const requiredPermission = getRequiredPermission(item.url);

      // Si la ruta no requiere permisos específicos, permitir acceso
      if (!requiredPermission) {
        return true;
      }

      // Verificar si el usuario tiene el permiso requerido
      return hasPermission(userPermissions, requiredPermission);
    });

    // Agregar el módulo solo si tiene items visibles
    if (filteredItems && filteredItems.length > 0) {
      filteredModules.push({
        ...modulo,
        items: filteredItems,
      });
    }
  }

  return filteredModules;
}
