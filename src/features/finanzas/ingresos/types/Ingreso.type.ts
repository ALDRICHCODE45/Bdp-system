export interface Ingreso {
  /**
   * Identificador único del ingreso
   */
  id: string;

  /**
   * Concepto o descripción del ingreso
   */
  concepto: string;

  /**
   * Cliente que generó el ingreso (referencia a ClienteProveedor)
   */
  cliente: string;

  /**
   * ID del cliente para relación con la tabla de clientes
   */
  clienteId: string;

  /**
   * Solicitante del ingreso (RJS, RGZ, CALFC)
   */
  solicitante: string;

  /**
   * Autorizador del ingreso (RJS, RGZ, CALFC)
   */
  autorizador: string;

  /**
   * Número de factura o documento
   */
  numeroFactura: string;

  /**
   * Folio fiscal de la factura
   */
  folioFiscal: string;

  /**
   * Período del ingreso (formato: YYYY-MM)
   */
  periodo: string;

  /**
   * Forma de pago (Transferencia, Efectivo, Cheque)
   */
  formaPago: "Transferencia" | "Efectivo" | "Cheque";

  /**
   * Origen del ingreso (banco, cuenta, etc.)
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
   * Empresa a la cual se hará el abono (BDP, CALFC, etc.)
   */
  cargoAbono: string;

  /**
   * Cantidad del ingreso en pesos mexicanos
   */
  cantidad: number;

  /**
   * Estado del ingreso (Pagado, Pendiente, Cancelado)
   */
  estado: "Pagado" | "Pendiente" | "Cancelado";

  /**
   * Fecha de pago del ingreso
   */
  fechaPago?: string;

  /**
   * Fecha de registro del ingreso
   */
  fechaRegistro: string;

  /**
   * Quién facturó (BDP, CALFC, GLOBAL, RGZ, RJS, APP)
   */
  facturadoPor: string;

  /**
   * Cliente o proyecto relacionado
   */
  clienteProyecto: string;

  /**
   * Fecha de participación (si aplica)
   */
  fechaParticipacion?: string;

  /**
   * Notas adicionales
   */
  notas?: string;
}
