export interface Factura {
  id: string;
  concepto: string;
  serie: string | null;
  folio: string | null;
  fechaEmision: string | null;
  subtotal: number;
  iva: number | null;
  totalImpuestosTransladados: number | null;
  totalImpuestosRetenidos: number | null;
  total: number;
  uuid: string;
  rfcEmisor: string;
  nombreReceptor: string | null;
  rfcReceptor: string;
  metodoPago: string | null;
  medioPago: string | null;
  moneda: string;
  usoCfdi: string | null;
  status: "vigente" | "cancelada";
  nombreEmisor: string | null;
  statusPago: string | null;
  fechaPago: string | null;
  facturaUrl: string | null;
  ingresadoPor: string | null;
  ingresadoPorNombre: string | null;
  createdAt: string;
  updatedAt: string;
}
