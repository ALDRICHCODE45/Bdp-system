"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { makeMovimientoExcelImportService } from "../services/makeMovimientoExcelImportService";
import type { MovimientoImportResultDto } from "../dtos/MovimientoImportResultDto.dto";
import { z } from "zod";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Input is ONLY the tempFileKey — NOT the preview DTO.
 * Server-side re-validation per REQ-EIS-001.
 */
const inputSchema = z.object({
  tempFileKey: z.string().min(1, "La clave del archivo temporal es requerida"),
});

/**
 * Server Action to execute the movimientos Excel import.
 * Re-reads the file from S3 temp storage and re-validates (REQ-EIS-001).
 */
export async function executeImportMovimientosAction(
  input: { tempFileKey: string }
): Promise<ActionResult<MovimientoImportResultDto>> {
  try {
    await requireAnyPermission([
      PermissionActions.movimientos.importar,
      PermissionActions.movimientos.gestionar,
    ]);

    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: "No autorizado" };
    }

    const parsed = inputSchema.parse(input);

    const importService = makeMovimientoExcelImportService({ prisma });
    const result = await importService.executeImport(
      parsed.tempFileKey,
      session.user.id
    );

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
    console.error("Error en executeImportMovimientosAction:", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al ejecutar la importacion",
    };
  }
}
