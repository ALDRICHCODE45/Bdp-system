"use server";

import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { makeMovimientoExcelImportService } from "../services/makeMovimientoExcelImportService";
import type { MovimientoImportPreviewDto } from "../dtos/MovimientoImportPreviewDto.dto";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Server Action to generate a preview of the movimientos Excel import.
 * Parses the file, validates rows, detects duplicates.
 */
export async function previewImportMovimientosAction(
  formData: FormData
): Promise<ActionResult<MovimientoImportPreviewDto>> {
  try {
    await requireAnyPermission([
      PermissionActions.movimientos.importar,
      PermissionActions.movimientos.gestionar,
    ]);

    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: "No autorizado" };
    }

    // Extract file from FormData
    const file = formData.get("file") as File | null;
    if (!file) {
      return { ok: false, error: "No se proporciono un archivo" };
    }

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      return {
        ok: false,
        error: "El archivo debe ser un Excel (.xlsx o .xls)",
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { ok: false, error: "El archivo no debe superar los 10MB" };
    }

    // Convert to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    const importService = makeMovimientoExcelImportService({ prisma });
    const result = await importService.previewImport(arrayBuffer);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    return { ok: true, data: result.value };
  } catch (error) {
    console.error("Error en previewImportMovimientosAction:", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al procesar el archivo",
    };
  }
}
