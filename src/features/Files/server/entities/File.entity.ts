export interface FileEntity {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  entityType: "FACTURA" | "EGRESO" | "INGRESO" | "CLIENTE_PROVEEDOR";
  entityId: string;
  uploadedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
