export type CreateFacturaDto = {
  tipoOrigen: "INGRESO" | "EGRESO";
  origenId: string;
  clienteProveedorId: string;
  clienteProveedor: string;
  concepto: string;
  monto: number;
  periodo: string;
  numeroFactura: string;
  folioFiscal: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  estado: "BORRADOR" | "ENVIADA" | "PAGADA" | "CANCELADA";
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  rfcEmisor: string;
  rfcReceptor: string;
  direccionEmisor: string;
  direccionReceptor: string;
  fechaPago?: Date | null;
  fechaRegistro: Date;
  creadoPor: string;
  autorizadoPor: string;
  notas?: string | null;
  ingresadoPor?: string | null;
};

