"use client";

import { useState, useEffect } from "react";
import { syncRolePermissionsAction } from "@/features/sistema/config/permissions/server/actions/syncRolePermissionsAction";
import { getRolePermissionsAction } from "@/features/sistema/config/permissions/server/actions/getRolePermissionsAction";
import { getPermissionsAction } from "@/features/sistema/config/permissions/server/actions/getPermissionsAction";
import { PermissionDto } from "@/features/sistema/config/permissions/types/PermissionDto.dto";
import { PERMISSIONS_BY_MODULE } from "@/core/lib/permissions/permissions.constant";
import { showToast } from "@/core/shared/helpers/CustomToast";

export function useAssignPermissions(roleId: string | null) {
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar todos los permisos disponibles
  useEffect(() => {
    if (!roleId) return;

    const loadPermissions = async () => {
      setIsLoading(true);
      try {
        const [allPermissionsResult, rolePermissionsResult] = await Promise.all(
          [getPermissionsAction(), getRolePermissionsAction(roleId)]
        );

        if (allPermissionsResult.ok && rolePermissionsResult.ok) {
          setPermissions(allPermissionsResult.data);
          setSelectedPermissionIds(rolePermissionsResult.data.map((p) => p.id));
        } else {
          showToast({
            title: "Error",
            description: "No se pudieron cargar los permisos",
            type: "error",
          });
        }
      } catch {
        showToast({
          title: "Error",
          description: "Error al cargar permisos",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, [roleId]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  const toggleModularPermission = (resource: string) => {
    const resourcePermissions = permissions.filter(
      (p) => p.resource === resource
    );
    const modularPermission = resourcePermissions.find(
      (p) => p.action === "gestionar"
    );
    const accessPermission = resourcePermissions.find(
      (p) => p.action === "acceder"
    );
    const actionPermissions = resourcePermissions.filter(
      (p) => p.action !== "gestionar" && p.action !== "acceder"
    );

    if (!modularPermission) return;

    const hasModular = selectedPermissionIds.includes(modularPermission.id);
    const hasAllActions = actionPermissions.every((p) =>
      selectedPermissionIds.includes(p.id)
    );

    if (hasModular || hasAllActions) {
      // Desmarcar modular, acceder y todas las acciones
      setSelectedPermissionIds((prev) =>
        prev.filter(
          (id) =>
            id !== modularPermission.id &&
            (accessPermission ? id !== accessPermission.id : true) &&
            !actionPermissions.some((p) => p.id === id)
        )
      );
    } else {
      // Marcar modular y acceder (incluye todas las acciones implícitamente)
      const newIds = [
        ...selectedPermissionIds.filter(
          (id) => !actionPermissions.some((p) => p.id === id)
        ),
        modularPermission.id,
      ];
      if (accessPermission) {
        newIds.push(accessPermission.id);
      }
      setSelectedPermissionIds(newIds);
    }
  };

  const savePermissions = async () => {
    if (!roleId) return;

    setIsSaving(true);
    try {
      const result = await syncRolePermissionsAction({
        roleId,
        permissionIds: selectedPermissionIds,
      });

      if (result.ok) {
        showToast({
          title: "Éxito",
          description: "Permisos asignados correctamente",
          type: "success",
        });
        return true;
      } else {
        showToast({
          title: "Error",
          description: result.error || "Error al asignar permisos",
          type: "error",
        });
        return false;
      }
    } catch {
      showToast({
        title: "Error",
        description: "Error al guardar permisos",
        type: "error",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const getPermissionsByModule = () => {
    const modules: Record<string, PermissionDto[]> = {};

    permissions.forEach((permission) => {
      const modulo =
        Object.keys(PERMISSIONS_BY_MODULE).find((mod) =>
          PERMISSIONS_BY_MODULE[mod as keyof typeof PERMISSIONS_BY_MODULE].some(
            (p) => p.name === permission.name
          )
        ) || "otros";

      if (!modules[modulo]) {
        modules[modulo] = [];
      }
      modules[modulo].push(permission);
    });

    return modules;
  };

  const isModularSelected = (resource: string): boolean => {
    const modularPermission = permissions.find(
      (p) => p.resource === resource && p.action === "gestionar"
    );
    return modularPermission
      ? selectedPermissionIds.includes(modularPermission.id)
      : false;
  };

  const isPermissionSelected = (permissionId: string): boolean => {
    return selectedPermissionIds.includes(permissionId);
  };

  const hasAnyPermission = (resource: string): boolean => {
    const resourcePermissions = permissions.filter(
      (p) => p.resource === resource
    );
    return resourcePermissions.some((p) =>
      selectedPermissionIds.includes(p.id)
    );
  };

  const getPermissionStats = (resource: string) => {
    const resourcePermissions = permissions.filter(
      (p) => p.resource === resource
    );
    const modularPermission = resourcePermissions.find(
      (p) => p.action === "gestionar"
    );
    const actionPermissions = resourcePermissions.filter(
      (p) => p.action !== "gestionar" && p.action !== "acceder"
    );
    const accessPermission = resourcePermissions.find(
      (p) => p.action === "acceder"
    );

    const hasModular = modularPermission
      ? selectedPermissionIds.includes(modularPermission.id)
      : false;
    const assignedActions = actionPermissions.filter((p) =>
      selectedPermissionIds.includes(p.id)
    ).length;
    const hasAccess = accessPermission
      ? selectedPermissionIds.includes(accessPermission.id)
      : false;

    const totalPermissions = resourcePermissions.length;
    const assignedPermissions = resourcePermissions.filter((p) =>
      selectedPermissionIds.includes(p.id)
    ).length;

    return {
      hasModular,
      assignedActions,
      hasAccess,
      totalPermissions,
      assignedPermissions,
      totalActions: actionPermissions.length,
    };
  };

  const getTotalAssignedPermissions = (): number => {
    return selectedPermissionIds.length;
  };

  return {
    permissions,
    selectedPermissionIds,
    isLoading,
    isSaving,
    togglePermission,
    toggleModularPermission,
    savePermissions,
    getPermissionsByModule,
    isModularSelected,
    isPermissionSelected,
    hasAnyPermission,
    getPermissionStats,
    getTotalAssignedPermissions,
  };
}
