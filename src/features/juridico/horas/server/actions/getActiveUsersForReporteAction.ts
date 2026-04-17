"use server";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export type ActiveUserReporteDto = {
  id: string;
  name: string;
  email: string;
};

export const getActiveUsersForReporteAction = async (): Promise<
  { ok: true; data: ActiveUserReporteDto[] } | { ok: false; error: string }
> => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"]["ver-reportes"],
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para ver reportes de horas"
  );

  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    return {
      ok: true,
      data: users.map((u) => ({
        id: u.id,
        name: u.name ?? "",
        email: u.email ?? "",
      })),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Error al obtener usuarios",
    };
  }
};
