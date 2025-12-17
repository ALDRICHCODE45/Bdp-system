"use server";

import { makeFacturaExcelImportService } from "../services/makeFacturaExcelImportService";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { ImportExcelPreviewDto } from "../dtos/ImportExcelPreviewDto.dto";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Server Action para generar un preview de la importación de facturas desde Excel.
 * Parsea el archivo, valida las filas, detecta duplicados y clientes nuevos.
 */
export async function previewImportFacturasAction(
  formData: FormData
): Promise<ActionResult<ImportExcelPreviewDto>> {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: "No autorizado" };
    }

    // Obtener archivo del FormData
    const file = formData.get("file") as File | null;
    if (!file) {
      return { ok: false, error: "No se proporcionó un archivo" };
    }

    // Validar tipo de archivo
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return { ok: false, error: "El archivo debe ser un Excel (.xlsx o .xls)" };
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { ok: false, error: "El archivo no debe superar los 10MB" };
    }

    // Convertir archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Crear servicio y generar preview
    const importService = makeFacturaExcelImportService({ prisma });
    const result = await importService.previewImport(arrayBuffer, file.name);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    return { ok: true, data: result.value };
  } catch (error) {
    console.error("Error en previewImportFacturasAction:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error desconocido al procesar el archivo",
    };
  }
}
