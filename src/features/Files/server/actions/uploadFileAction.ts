"use server";

import { DocumentCategory } from "@prisma/client";
import { makeFileService } from "../services/makeFileService";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { revalidatePath } from "next/cache";

/**
 * P5 — widened to include COLABORADOR (cap12 req1) + optional `expiryDate`
 * and `category` for the Documentos / CV uploads (cap8 + cap10). The path
 * map also picks up COLABORADOR so the perfil route gets busted on upload.
 */
export const uploadFileAction = async (formData: FormData) => {
  const session = await auth();
  const uploadedBy = session?.user?.id || null;

  const file = formData.get("file") as File;
  const entityType = formData.get("entityType") as
    | "FACTURA"
    | "MOVIMIENTO"
    | "CLIENTE_PROVEEDOR"
    | "COLABORADOR";
  const entityId = formData.get("entityId") as string;
  const expiryDateRaw = formData.get("expiryDate");
  const categoryRaw = formData.get("category");

  if (!file) {
    return { ok: false, error: "No se proporcionó ningún archivo" };
  }

  if (!entityType || !entityId) {
    return {
      ok: false,
      error: "Se requiere entityType y entityId",
    };
  }

  // Normalize optional fields. Empty / missing values land as null so the
  // DTO surface stays "nullable → not persisted" for the existing entityTypes.
  const expiryDate =
    typeof expiryDateRaw === "string" && expiryDateRaw.trim() !== ""
      ? expiryDateRaw
      : null;
  const category =
    typeof categoryRaw === "string" &&
    categoryRaw.trim() !== "" &&
    isDocumentCategory(categoryRaw)
      ? categoryRaw
      : null;

  const fileService = makeFileService({ prisma });
  const result = await fileService.uploadFile(
    file,
    entityType,
    entityId,
    uploadedBy,
    { expiryDate, category }
  );

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  // Revalidar la ruta correspondiente según el tipo de entidad.
  // COLABORADOR busts the per-colaborador profile route so the Documentos
  // and CV tabs reflect the new file immediately on the next render.
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

  return { ok: true, data: result.value };
};

/**
 * Narrow a raw string from FormData to a `DocumentCategory` enum value.
 * Anything unknown (including null / empty) returns false so the action
 * can safely coerce to `null` on the DTO.
 */
function isDocumentCategory(value: string): value is DocumentCategory {
  return (
    value === "CONTRATO" ||
    value === "INE" ||
    value === "RFC" ||
    value === "COMPROBANTE_DOMICILIO" ||
    value === "OTRO"
  );
}

