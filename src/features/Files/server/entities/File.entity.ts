import type { DocumentCategory } from "@prisma/client";

/**
 * P5 — FileService widening: COLABORADOR added to the entityType union
 * (cap12 req1). `expiryDate` + `category` added as nullable fields so the
 * existing entityTypes are unchanged (cap12 req3). The expiry badge
 * component (CC9) reads `expiryDate` client-side and `category` drives
 * the Documentos tab filter chips (cap8 req6).
 */
export interface FileEntity {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  entityType: "FACTURA" | "MOVIMIENTO" | "CLIENTE_PROVEEDOR" | "COLABORADOR";
  entityId: string;
  uploadedBy: string | null;
  expiryDate: Date | null;
  category: DocumentCategory | null;
  createdAt: Date;
  updatedAt: Date;
}
