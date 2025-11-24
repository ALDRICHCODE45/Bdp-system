"use server";

import { makeFileService } from "../services/makeFileService";
import prisma from "@/core/lib/prisma";
import { revalidatePath } from "next/cache";

export const deleteFileAction = async (formData: FormData) => {
  const fileId = formData.get("fileId") as string;
  const entityType = formData.get("entityType") as
    | "FACTURA"
    | "EGRESO"
    | "INGRESO"
    | "CLIENTE_PROVEEDOR";

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
    EGRESO: "/egresos",
    INGRESO: "/ingresos",
    CLIENTE_PROVEEDOR: "/clientes-proovedores",
  };

  const path = pathMap[entityType];
  if (path) {
    revalidatePath(path);
  }

  return { ok: true };
};

