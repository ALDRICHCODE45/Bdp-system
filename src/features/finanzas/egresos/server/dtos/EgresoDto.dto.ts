export type EgresoDto = {
  id: string;
  concepto: string;
  clasificacion:
    | "gasto op"
    | "honorarios"
    | "servicios"
    | "arrendamiento"
    | "comisiones"
    | "disposición";
  categoria: "facturación" | "comisiones" | "disposición" | "bancarizaciones";
  proveedor: string;
  proveedorId: string;
  proveedorInfo: {
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
  cargoAbono: "bdp" | "calfc" | "global" | "rjz" | "app";
  cantidad: number;
  estado: "pagado" | "pendiente" | "cancelado";
  fechaPago: string | null;
  fechaRegistro: string;
  facturadoPor: "bdp" | "calfc" | "global" | "rgz" | "rjs" | "app";
  clienteProyecto: string | null;
  clienteProyectoId: string | null;
  clienteProyectoInfo: {
    id: string;
    nombre: string;
    rfc: string;
  } | null;
  notas: string | null;
  ingresadoPor: string | null;
  ingresadoPorNombre: string | null;
  createdAt: string;
  updatedAt: string;
};

