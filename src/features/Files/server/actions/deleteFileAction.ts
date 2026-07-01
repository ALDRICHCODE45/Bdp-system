"use server";

import { makeFileService } from "../services/makeFileService";
import prisma from "@/core/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * P5 — widened to include COLABORADOR (cap12 req1) AND the COLABORADOR
 * pathMap entry. Without this entry the delete path would silently bypass
 * `revalidatePath` for COLABORADOR files and the profile tab would show
 * stale data after a remove.
 */
export const deleteFileAction = async (formData: FormData) => {
  const fileId = formData.get("fileId") as string;
  const entityType = formData.get("entityType") as
    | "FACTURA"
    | "MOVIMIENTO"
    | "CLIENTE_PROVEEDOR"
    | "COLABORADOR";

  if (!fileId) {
    return { ok: false, error: "Se requiere el ID del archivo" };
  }

  const fileService = makeFileService({ prisma });
  const result = await fileService.deleteFile(fileId);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  // Revalidar la ruta correspondiente según el tipo de entidad
  const pathMap: Record<string, string> = {
    FACTURA: "/facturas",
    MOVIMIENTO: "/movimientos",
    CLIENTE_PROVEEDOR: "/clientes-proovedores",
    COLABORADOR: "/colaboradores",
  };

  const path = pathMap[entityType];
  if (path) {
    revalidatePath(path);
  }

  return { ok: true };
};

