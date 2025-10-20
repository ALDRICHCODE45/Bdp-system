export interface Visitante {
  /**
   * Identificador único del visitante
   */
  id: string;

  /**
   * Nombre de la persona o institución del visitante
   */
  nombre: string;

  /**
   * Nombre de la persona o institución a la que visita
   */
  destinatario: string;

  /**
   * Motivo de la visita
   */
  motivo: string;

  /**
   * Teléfono de contacto del visitante
   */
  telefonoContacto: string;

  /**
   * Si el visitante es de una correspondencia,
   * especificar cuál (ej: DHL, FedEx, etc). Es opcional.
   */
  correspondencia?: string;

  /**
   * Hora de entrada del visitante (formato: HH:mm o como string)
   */
  horaEntrada: string;

  /**
   * Hora de salida del visitante (opcional, formato: HH:mm o como string)
   */
  horaSalida?: string;
}
