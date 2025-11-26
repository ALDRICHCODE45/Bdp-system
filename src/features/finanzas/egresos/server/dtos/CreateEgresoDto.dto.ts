export type CreateEgresoDto = {
  concepto: string;
  clasificacion:
    | "GASTO_OP"
    | "HONORARIOS"
    | "SERVICIOS"
    | "ARRENDAMIENTO"
    | "COMISIONES"
    | "DISPOSICION";
  categoria: "FACTURACION" | "COMISIONES" | "DISPOSICION" | "BANCARIZACIONES";
  proveedor: string;
  proveedorId: string;
  solicitante: string;
  solicitanteId: string;
  autorizador: string;
  autorizadorId: string;
  numeroFactura: string;
  folioFiscal: string;
  periodo: string;
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  origen: string;
  numeroCuenta: string;
  clabe: string;
  cargoAbono: "BDP" | "CALFC" | "GLOBAL" | "RJZ" | "APP";
  cantidad: number;
  estado: "PAGADO" | "PENDIENTE" | "CANCELADO";
  fechaPago?: Date | null;
  fechaRegistro: Date;
  facturadoPor: "BDP" | "CALFC" | "GLOBAL" | "RGZ" | "RJS" | "APP";
  clienteProyecto: string | null;
  clienteProyectoId: string | null;
  notas?: string | null;
  ingresadoPor?: string | null;
};

