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
  solicitante: "rjs" | "rgz" | "calfc";
  autorizador: "rjs" | "rgz" | "calfc";
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
  createdAt: string;
  updatedAt: string;
};

