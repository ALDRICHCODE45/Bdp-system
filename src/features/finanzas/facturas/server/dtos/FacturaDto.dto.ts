export type FacturaDto = {
  id: string;
  tipoOrigen: "ingreso" | "egreso";
  origenId: string;
  clienteProveedorId: string;
  clienteProveedorInfo: {
    id: string;
    nombre: string;
    rfc: string;
    direccion: string;
  } | null;
  clienteProveedor: string;
  concepto: string;
  monto: number;
  periodo: string;
  numeroFactura: string;
  folioFiscal: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: "borrador" | "enviada" | "pagada" | "cancelada";
  formaPago: "transferencia" | "efectivo" | "cheque";
  rfcEmisor: string;
  rfcReceptor: string;
  direccionEmisor: string;
  direccionReceptor: string;
  fechaPago: string | null;
  fechaRegistro: string;
  creadoPor: string;
  autorizadoPor: string;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
};

