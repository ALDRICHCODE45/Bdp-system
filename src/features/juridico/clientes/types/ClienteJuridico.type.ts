export interface ClienteJuridico {
  /**
   * Identificador único del cliente jurídico
   */
  id: string;

  /**
   * Nombre o razón social del cliente jurídico
   */
  nombre: string;

  /**
   * Registro Federal de Contribuyentes
   */
  rfc?: string | null;

  /**
   * Nombre del contacto principal
   */
  contacto?: string | null;

  /**
   * Correo electrónico del cliente
   */
  email?: string | null;

  /**
   * Número de teléfono del cliente
   */
  telefono?: string | null;

  /**
   * Dirección física del cliente
   */
  direccion?: string | null;

  /**
   * Notas adicionales del cliente
   */
  notas?: string | null;

  /**
   * Indica si el cliente está activo (soft delete)
   */
  activo: boolean;

  /**
   * Fecha de creación del registro
   */
  createdAt: Date;

  /**
   * Fecha de última actualización
   */
  updatedAt: Date;
}

export type CreateClienteJuridicoInput = {
  nombre: string;
  rfc?: string | null;
  contacto?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  notas?: string | null;
};

export type UpdateClienteJuridicoInput = {
  id: string;
  nombre: string;
  rfc?: string | null;
  contacto?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  notas?: string | null;
};
