"use server";

import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { makeMovimientoService } from "../services/makeMovimientoService";
import type { MovimientoDto } from "../dtos/MovimientoDto.dto";
import { z } from "zod";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const inputSchema = z.object({
  id: z.string().uuid("ID de movimiento invalido"),
});

export async function getMovimientoByIdAction(
  input: { id: string }
): Promise<ActionResult<MovimientoDto | null>> {
  try {
    await requireAnyPermission([
      PermissionActions.movimientos.acceder,
      PermissionActions.movimientos.gestionar,
    ]);

    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: "No autorizado" };
    }

    const parsed = inputSchema.parse(input);

    const service = makeMovimientoService({ prisma });
    const result = await service.getById(parsed.id);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    return { ok: true, data: result.value };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message || "Error de validacion",
      };
    }
    console.error("Error en getMovimientoByIdAction:", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener movimiento",
    };
  }
}
