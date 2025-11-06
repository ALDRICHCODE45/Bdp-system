"use server";

import { makePermissionService } from "../services/makePermissionService";

export async function syncRolePermissionsAction(data: {
  roleId: string;
  permissionIds: string[];
}) {
  const permissionService = makePermissionService();
  const result = await permissionService.syncRolePermissions(data);

  if (!result.ok) {
    return { ok: false as const, error: "Ah ocurrido un error" };
  }

  return { ok: true as const, data: result.value };
}
