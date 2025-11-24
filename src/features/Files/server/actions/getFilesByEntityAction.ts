"use server";

import { makeFileService } from "../services/makeFileService";
import prisma from "@/core/lib/prisma";

export const getFilesByEntityAction = async (
  entityType: "FACTURA" | "EGRESO" | "INGRESO" | "CLIENTE_PROVEEDOR",
  entityId: string
) => {
  if (!entityType || !entityId) {
    return { ok: false, error: "Se requiere entityType y entityId" };
  }

  const fileService = makeFileService({ prisma });
  const result = await fileService.getFilesByEntity(entityType, entityId);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true, data: result.value };
};

