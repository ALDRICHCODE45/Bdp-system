export interface RegistroHoraType {
  id: string;
  usuarioId: string;
  equipoJuridicoId: string;
  clienteJuridicoId: string;
  asuntoJuridicoId: string;
  socioId: string;
  horas: number;
  descripcion: string | null;
  ano: number;
  semana: number;
  editable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateRegistroHoraInput = {
  equipoJuridicoId: string;
  clienteJuridicoId: string;
  asuntoJuridicoId: string;
  socioId: string;
  horas: number;
  descripcion?: string | null;
};

export type UpdateRegistroHoraInput = {
  id: string;
  equipoJuridicoId: string;
  clienteJuridicoId: string;
  asuntoJuridicoId: string;
  socioId: string;
  horas: number;
  descripcion?: string | null;
};
