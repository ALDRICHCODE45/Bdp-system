"use server";

import { revalidatePath } from "next/cache";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { makeMovimientoService } from "../services/makeMovimientoService";
import { z } from "zod";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const inputSchema = z.object({
  id: z.string().uuid("ID de movimiento invalido"),
});

export async function deleteMovimientoAction(
  input: { id: string }
): Promise<ActionResult<void>> {
  try {
    await requireAnyPermission([
      PermissionActions.movimientos.eliminar,
      PermissionActions.movimientos.gestionar,
    ]);

    const parsed = inputSchema.parse(input);

    const service = makeMovimientoService({ prisma });
    const result = await service.delete(parsed.id);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    revalidatePath("/movimientos");
    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message || "Error de validacion",
      };
    }
    console.error("Error en deleteMovimientoAction:", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al eliminar movimiento",
    };
  }
}
