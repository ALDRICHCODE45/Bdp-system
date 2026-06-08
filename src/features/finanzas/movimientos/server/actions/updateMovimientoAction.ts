"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { makeMovimientoService } from "../services/makeMovimientoService";
import { updateMovimientoValidator } from "../validators/updateMovimientoValidator";
import type { MovimientoDto } from "../dtos/MovimientoDto.dto";
import { z } from "zod";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function updateMovimientoAction(
  input: unknown
): Promise<ActionResult<MovimientoDto>> {
  try {
    await requireAnyPermission([
      PermissionActions.movimientos.editar,
      PermissionActions.movimientos.gestionar,
    ]);

    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: "No autorizado" };
    }

    // Server-side validation — enforces tipo/dedupHash immutability
    const parsed = updateMovimientoValidator.parse(input);

    const service = makeMovimientoService({ prisma });
    const result = await service.update({
      ...parsed,
      usuarioId: session.user.id,
    });

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    revalidatePath("/movimientos");
    return { ok: true, data: result.value };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message || "Error de validacion",
      };
    }
    console.error("Error en updateMovimientoAction:", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al actualizar movimiento",
    };
  }
}
