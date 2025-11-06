"use server";

import { makePermissionService } from "../services/makePermissionService";

export async function getRolePermissionsAction(roleId: string) {
  const permissionService = makePermissionService();
  const result = await permissionService.getByRoleId(roleId);

  if (!result.ok) {
    return { ok: false as const, error: "Ah ocurrido un error" };
  }

  return { ok: true as const, data: result.value };
}
