export interface Egreso {
  /**
   * Identificador único del egreso
   */
  id: string;

  /**
   * Concepto o descripción del egreso
   */
  concepto: string;

  /**
   * Clasificación del egreso (Gasto Op, Honorarios, etc.)
   */
  clasificacion:
    | "Gasto Op"
    | "Honorarios"
    | "Servicios"
    | "Arrendamiento"
    | "Comisiones"
    | "Disposición";

  /**
   * Categoría del egreso (Facturación, Comisiones, Disposición, etc.)
   */
  categoria: "Facturación" | "Comisiones" | "Disposición" | "Bancarizaciones";

  /**
   * Proveedor que genera el egreso (referencia a ClienteProveedor)
   */
  proveedor: string;

  /**
   * ID del proveedor para relación con la tabla de proveedores
   */
  proveedorId: string;

  /**
   * Solicitante del egreso (RJS, RGZ, CALFC)
   */
  solicitante: "RJS" | "RGZ" | "CALFC";

  /**
   * Autorizador del egreso (RJS, RGZ, CALFC)
   */
  autorizador: "RJS" | "RGZ" | "CALFC";

  /**
   * Número de factura o documento
   */
  numeroFactura: string;

  /**
   * Folio fiscal de la factura
   */
  folioFiscal: string;

  /**
   * Período del egreso (formato: YYYY-MM)
   */
  periodo: string;

  /**
   * Forma de pago (Transferencia, Efectivo, Cheque)
   */
  formaPago: "Transferencia" | "Efectivo" | "Cheque";

  /**
   * Origen del pago (banco, cuenta, etc.)
   */
  origen: string;

  /**
   * Número de cuenta bancaria
   */
  numeroCuenta: string;

  /**
   * CLABE interbancaria
   */
  clabe: string;

  /**
   * Empresa a la cual se hará el cargo (BDP, CALFC, etc.)
   */
  cargoAbono: "BDP" | "CALFC" | "GLOBAL" | "RJZ" | "APP";

  /**
   * Cantidad del egreso en pesos mexicanos
   */
  cantidad: number;

  /**
   * Estado del egreso (Pagado, Pendiente, Cancelado)
   */
  estado: "Pagado" | "Pendiente" | "Cancelado";

  /**
   * Fecha de pago del egreso
   */
  fechaPago?: string;

  /**
   * Fecha de registro del egreso
   */
  fechaRegistro: string;

  /**
   * Quién facturó (BDP, CALFC, GLOBAL, RGZ, RJS, APP)
   */
  facturadoPor: "BDP" | "CALFC" | "GLOBAL" | "RJZ" | "APP";

  /**
   * Cliente o proyecto relacionado
   */
  clienteProyecto: string;

  /**
   * Notas adicionales
   */
  notas?: string;
}
