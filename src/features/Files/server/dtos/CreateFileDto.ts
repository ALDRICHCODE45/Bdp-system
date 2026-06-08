export interface CreateFileDto {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  entityType: "FACTURA" | "MOVIMIENTO" | "CLIENTE_PROVEEDOR";
  entityId: string;
  uploadedBy?: string | null;
}
