"use server";

import { makePermissionService } from "../services/makePermissionService";

export async function getPermissionsAction() {
  const permissionService = makePermissionService();
  const result = await permissionService.getAll();

  if (!result.ok) {
    return { ok: false as const, error: "Ah ocurrido un error" };
  }

  return { ok: true as const, data: result.value };
}
