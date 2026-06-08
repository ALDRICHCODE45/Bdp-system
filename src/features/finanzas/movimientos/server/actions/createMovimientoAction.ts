"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { makeMovimientoService } from "../services/makeMovimientoService";
import { createMovimientoValidator } from "../validators/createMovimientoValidator";
import { computeMovimientoDedupHash } from "../../helpers/movimientoDedupHash";
import type { MovimientoDto } from "../dtos/MovimientoDto.dto";
import { z } from "zod";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function createMovimientoAction(
  input: unknown
): Promise<ActionResult<MovimientoDto>> {
  try {
    await requireAnyPermission([
      PermissionActions.movimientos.crear,
      PermissionActions.movimientos.gestionar,
    ]);

    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: "No autorizado" };
    }

    // Server-side validation (defense in depth)
    const parsed = createMovimientoValidator.parse(input);

    // Compute dedupHash to satisfy CreateMovimientoArgs type contract
    // (the service re-verifies uniqueness internally)
    const dedupHash = computeMovimientoDedupHash({
      titular: parsed.titular,
      estadoCuenta: parsed.estadoCuenta,
      fechaOperacion: parsed.fechaOperacion,
      monto: parsed.monto,
      descripcionLiteral: parsed.descripcionLiteral,
    });

    const service = makeMovimientoService({ prisma });
    const result = await service.create({
      ...parsed,
      dedupHash,
      ingresadoPor: session.user.id,
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
    console.error("Error en createMovimientoAction:", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al crear movimiento",
    };
  }
}
