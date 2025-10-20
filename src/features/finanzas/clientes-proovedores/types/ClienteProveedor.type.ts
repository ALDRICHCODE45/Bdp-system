export interface ClienteProveedor {
  /**
   * Identificador único del cliente/proveedor
   */
  id: string;

  /**
   * Nombre o razón social del cliente/proveedor
   */
  nombre: string;

  /**
   * RFC del cliente/proveedor
   */
  rfc: string;

  /**
   * Tipo: 'cliente' o 'proveedor'
   */
  tipo: "cliente" | "proveedor";

  /**
   * Dirección fiscal
   */
  direccion: string;

  /**
   * Teléfono de contacto
   */
  telefono: string;

  /**
   * Email de contacto
   */
  email: string;

  /**
   * Contacto principal (persona de contacto)
   */
  contacto: string;

  /**
   * Número de cuenta bancaria
   */
  numeroCuenta?: string;

  /**
   * CLABE interbancaria
   */
  clabe?: string;

  /**
   * Banco donde tiene la cuenta
   */
  banco?: string;

  /**
   * Si está activo o no
   */
  activo: boolean;

  /**
   * Fecha de registro
   */
  fechaRegistro: string;

  /**
   * Notas adicionales
   */
  notas?: string;
}
