import type { DocumentCategory } from "@prisma/client";

/**
 * P5 — FileService widening: COLABORADOR added to the entityType union
 * (cap12 req1). All existing entityTypes continue to work unchanged.
 *
 * `expiryDate` and `category` are nullable and optional so the existing
 * FACTURA / MOVIMIENTO / CLIENTE_PROVEEDOR paths are unaffected (cap12 req3 +
 * req4). The DTO accepts either a `Date` (server-internal) or an ISO string
 * (server-action boundary) for `expiryDate` so the action layer doesn't have
 * to coerce before calling the service.
 */
export interface CreateFileDto {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  entityType: "FACTURA" | "MOVIMIENTO" | "CLIENTE_PROVEEDOR" | "COLABORADOR";
  entityId: string;
  uploadedBy?: string | null;
  expiryDate?: Date | string | null;
  category?: DocumentCategory | null;
}
