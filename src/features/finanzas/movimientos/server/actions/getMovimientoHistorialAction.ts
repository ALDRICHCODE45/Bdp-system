"use server";

import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { PrismaMovimientoHistorialRepository } from "../repositories/PrismaMovimientoHistorialRepository.repository";
import { MovimientoHistorialService } from "../services/MovimientoHistorialService.service";
import type { MovimientoHistorialDto } from "../dtos/MovimientoHistorialDto.dto";
import { z } from "zod";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const inputSchema = z.object({
  movimientoId: z.string().uuid("ID de movimiento invalido"),
});

export async function getMovimientoHistorialAction(
  input: { movimientoId: string }
): Promise<ActionResult<MovimientoHistorialDto[]>> {
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

    // Verify movimiento exists
    const movimiento = await prisma.movimiento.findUnique({
      where: { id: parsed.movimientoId },
      select: { id: true },
    });

    if (!movimiento) {
      return { ok: false, error: "Movimiento no encontrado" };
    }

    const historialRepo = new PrismaMovimientoHistorialRepository(prisma);
    const historialService = new MovimientoHistorialService(historialRepo);
    const result = await historialService.getByMovimientoId(
      parsed.movimientoId
    );

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
    console.error("Error en getMovimientoHistorialAction:", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener historial",
    };
  }
}
