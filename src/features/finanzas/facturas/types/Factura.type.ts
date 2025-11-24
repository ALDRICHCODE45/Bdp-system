export interface Factura {
  /**
   * Identificador único de la factura
   */
  id: string;

  /**
   * Tipo de origen: 'ingreso' o 'egreso'
   */
  tipoOrigen: "ingreso" | "egreso";

  /**
   * ID del ingreso o egreso que origina esta factura
   */
  origenId: string;

  /**
   * ID del cliente o proveedor (FK a ClienteProveedor)
   */
  clienteProveedorId: string;

  /**
   * Nombre del cliente o proveedor (para mostrar)
   */
  clienteProveedor: string;

  /**
   * Concepto de la factura (copiado del origen)
   */
  concepto: string;

  /**
   * Monto de la factura (copiado del origen)
   */
  monto: number;

  /**
   * Período de la factura (copiado del origen)
   */
  periodo: string;

  /**
   * Número de factura
   */
  numeroFactura: string;

  /**
   * Folio fiscal del SAT
   */
  folioFiscal: string;

  /**
   * Fecha de emisión de la factura
   */
  fechaEmision: string;

  /**
   * Fecha de vencimiento de la factura
   */
  fechaVencimiento: string;

  /**
   * Estado de la factura
   */
  estado: "Borrador" | "Enviada" | "Pagada" | "Cancelada";

  /**
   * Forma de pago (copiado del origen)
   */
  formaPago: "Transferencia" | "Efectivo" | "Cheque";

  /**
   * RFC del emisor (empresa que emite la factura)
   */
  rfcEmisor: string;

  /**
   * RFC del receptor (cliente o proveedor)
   */
  rfcReceptor: string;

  /**
   * Dirección del emisor
   */
  direccionEmisor: string;

  /**
   * Dirección del receptor
   */
  direccionReceptor: string;

  /**
   * Fecha de pago (se llena cuando se marca como pagada)
   */
  fechaPago?: string;

  /**
   * Fecha de registro de la factura
   */
  fechaRegistro: string;

  /**
   * Quién creó la factura
   */
  creadoPor: string;

  /**
   * Quién autorizó la factura
   */
  autorizadoPor: string;

  /**
   * Notas adicionales
   */
  notas?: string;
}
