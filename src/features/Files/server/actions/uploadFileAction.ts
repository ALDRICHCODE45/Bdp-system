"use server";

import { makeFileService } from "../services/makeFileService";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { revalidatePath } from "next/cache";

export const uploadFileAction = async (formData: FormData) => {
  const session = await auth();
  const uploadedBy = session?.user?.id || null;

  const file = formData.get("file") as File;
  const entityType = formData.get("entityType") as
    | "FACTURA"
    | "EGRESO"
    | "INGRESO"
    | "CLIENTE_PROVEEDOR";
  const entityId = formData.get("entityId") as string;

  if (!file) {
    return { ok: false, error: "No se proporcionó ningún archivo" };
  }

  if (!entityType || !entityId) {
    return {
      ok: false,
      error: "Se requiere entityType y entityId",
    };
  }

  const fileService = makeFileService({ prisma });
  const result = await fileService.uploadFile(file, entityType, entityId, uploadedBy);

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

  return { ok: true, data: result.value };
};

