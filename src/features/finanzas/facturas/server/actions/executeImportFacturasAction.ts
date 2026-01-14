"use server";

import { revalidatePath } from "next/cache";
import { makeFacturaExcelImportService } from "../services/makeFacturaExcelImportService";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { ImportExcelPreviewDto, ImportOptionsDto } from "../dtos/ImportExcelPreviewDto.dto";
import { ImportExecutionResultDto } from "../dtos/ImportFacturaResultDto.dto";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Server Action para ejecutar la importación de facturas desde Excel.
 * Recibe el preview generado y las opciones seleccionadas por el usuario.
 */
export async function executeImportFacturasAction(
  preview: ImportExcelPreviewDto,
  options: ImportOptionsDto
): Promise<ActionResult<ImportExecutionResultDto>> {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: "No autorizado" };
    }

    const usuarioId = session.user.id || null;

    // Validar que hay datos para importar
    const hasSinVinculacionConAccion = preview.sinVinculacion?.some(
      (item) => options.accionesSinVinculacion?.[item.row.rowNumber]
    );
    
    if (
      preview.nuevas.length === 0 &&
      preview.duplicadas.length === 0 &&
      !hasSinVinculacionConAccion
    ) {
      return { ok: false, error: "No hay facturas para importar" };
    }

    // Crear servicio y ejecutar importación
    const importService = makeFacturaExcelImportService({ prisma });
    const result = await importService.executeImport(preview, options, usuarioId);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    // Revalidar las rutas afectadas por la importación
    revalidatePath("/facturas");
    revalidatePath("/ingresos");
    revalidatePath("/egresos");
    revalidatePath("/clientes-proovedores");

    return { ok: true, data: result.value };
  } catch (error) {
    console.error("Error en executeImportFacturasAction:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error desconocido al ejecutar la importación",
    };
  }
}
