"use server";

import { makeFileService } from "../services/makeFileService";
import prisma from "@/core/lib/prisma";

/**
 * P5 — widened to include COLABORADOR (cap12 req1). The returned
 * `FileEntity` shape now carries `expiryDate` + `category` (nullable for
 * the existing entityTypes) — see File.entity.ts.
 */
export const getFilesByEntityAction = async (
  entityType:
    | "FACTURA"
    | "MOVIMIENTO"
    | "CLIENTE_PROVEEDOR"
    | "COLABORADOR",
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

