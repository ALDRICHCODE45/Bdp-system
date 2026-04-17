export interface EquipoJuridico {
  /**
   * Identificador único del equipo jurídico
   */
  id: string;

  /**
   * Nombre del equipo jurídico
   */
  nombre: string;

  /**
   * Descripción del equipo jurídico
   */
  descripcion?: string | null;

  /**
   * Indica si el equipo está activo (soft delete)
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

export type CreateEquipoJuridicoInput = {
  nombre: string;
  descripcion?: string | null;
};

export type UpdateEquipoJuridicoInput = {
  id: string;
  nombre: string;
  descripcion?: string | null;
};
