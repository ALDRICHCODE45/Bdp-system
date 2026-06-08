"use server";

import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { makeMovimientoService } from "../services/makeMovimientoService";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function getDistinctTitularesAction(): Promise<
  ActionResult<string[]>
> {
  try {
    await requireAnyPermission([
      PermissionActions.movimientos.acceder,
      PermissionActions.movimientos.gestionar,
    ]);

    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: "No autorizado" };
    }

    const service = makeMovimientoService({ prisma });
    const result = await service.getDistinctTitulares();

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    return { ok: true, data: result.value };
  } catch (error) {
    console.error("Error en getDistinctTitularesAction:", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener titulares",
    };
  }
}
