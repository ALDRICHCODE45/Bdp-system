"use server";
import { auth } from "@/core/lib/auth/auth";
import { makeRegistroHoraService } from "../services/makeRegistroHoraService";
import { toRegistroHoraDtoArray } from "../mappers/registroHoraMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { hasAnyPermission } from "@/core/lib/permissions/permission-checker";

export const getRegistrosHorasAction = async () => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"].acceder,
      PermissionActions["juridico-horas"].registrar,
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para acceder al módulo de horas"
  );

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "No autenticado" };
  }

  const service = makeRegistroHoraService({ prisma });
  const userId = session.user.id;
  const userPermissions = session.user.permissions || [];

  // Use hasAnyPermission which correctly handles admin:all
  const isAdmin = hasAnyPermission(userPermissions, [
    PermissionActions["juridico-horas"].gestionar,
    PermissionActions["juridico-horas"]["ver-reportes"],
  ]);

  const result = isAdmin
    ? await service.getAll()
    : await service.getByUsuario(userId);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  return {
    ok: true as const,
    data: toRegistroHoraDtoArray(result.value),
  };
};
