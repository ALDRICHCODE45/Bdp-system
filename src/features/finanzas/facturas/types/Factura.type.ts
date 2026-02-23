export interface Factura {
  id: string;
  concepto: string;
  serie: string | null;
  folio: string | null;
  subtotal: number;
  totalImpuestosTransladados: number | null;
  totalImpuestosRetenidos: number | null;
  total: number;
  uuid: string;
  rfcEmisor: string;
  nombreReceptor: string | null;
  rfcReceptor: string;
  metodoPago: string | null;
  moneda: string;
  usoCfdi: string | null;
  status: "borrador" | "enviada" | "pagada" | "cancelada";
  nombreEmisor: string | null;
  statusPago: string | null;
  fechaPago: string | null;
  ingresadoPor: string | null;
  ingresadoPorNombre: string | null;
  createdAt: string;
  updatedAt: string;
}
