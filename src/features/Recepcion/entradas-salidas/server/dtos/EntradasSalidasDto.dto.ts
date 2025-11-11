export type EntradasSalidasDTO = {
  id: string;
  visitante: string;
  destinatario: string;
  motivo: string;
  telefono?: string | null;
  correspondencia?: string | null;
  fecha: Date;
  hora_entrada: Date;
  hora_salida: Date;
  createdAt: Date;
  updatedAt: Date;
};
