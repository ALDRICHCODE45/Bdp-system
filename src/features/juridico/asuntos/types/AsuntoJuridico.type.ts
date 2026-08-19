export interface AsuntoJuridico {
  /**
   * Identificador único del asunto jurídico
   */
  id: string;

  /**
   * Nombre o descripción corta del asunto
   */
  nombre: string;

  /**
   * Descripción detallada del asunto
   */
  descripcion?: string | null;

  /**
   * Estado del asunto jurídico
   */
  estado: "ACTIVO" | "INACTIVO" | "CERRADO";

  /**
   * ID del cliente/proveedor asociado (juridico uses ClienteProveedor tipo CLIENTE)
   */
  clienteProveedorId: string;

  /**
   * ID del socio responsable del asunto
   */
  socioId: string;

  /**
   * Fecha de creación del registro
   */
  createdAt: Date;

  /**
   * Fecha de última actualización
   */
  updatedAt: Date;
}

export type CreateAsuntoJuridicoInput = {
  nombre: string;
  descripcion?: string | null;
  clienteProveedorId: string;
  socioId: string;
};

export type UpdateAsuntoJuridicoInput = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  clienteProveedorId: string;
  socioId: string;
  estado: "ACTIVO" | "INACTIVO" | "CERRADO";
};
