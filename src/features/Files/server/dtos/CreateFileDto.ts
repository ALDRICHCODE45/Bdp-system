export interface CreateFileDto {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  entityType: "FACTURA" | "EGRESO" | "INGRESO" | "CLIENTE_PROVEEDOR";
  entityId: string;
  uploadedBy?: string | null;
}
