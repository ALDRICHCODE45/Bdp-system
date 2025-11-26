export type IngresoDto = {
  id: string;
  concepto: string;
  cliente: string;
  clienteId: string;
  clienteInfo: {
    id: string;
    nombre: string;
    rfc: string;
  } | null;
  solicitanteId: string | null;
  solicitanteNombre: string | null;
  autorizadorId: string | null;
  autorizadorNombre: string | null;
  numeroFactura: string;
  folioFiscal: string;
  periodo: string;
  formaPago: "transferencia" | "efectivo" | "cheque";
  origen: string;
  numeroCuenta: string;
  clabe: string;
  cargoAbono: "bdp" | "calfc";
  cantidad: number;
  estado: "pagado" | "pendiente" | "cancelado";
  fechaPago: string | null;
  fechaRegistro: string;
  facturadoPor: "bdp" | "calfc" | "global" | "rgz" | "rjs" | "app";
  clienteProyecto: string;
  fechaParticipacion: string | null;
  notas: string | null;
  ingresadoPor: string | null;
  ingresadoPorNombre: string | null;
  createdAt: string;
  updatedAt: string;
};

