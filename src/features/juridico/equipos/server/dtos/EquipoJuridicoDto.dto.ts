export type EquipoJuridicoMiembroDto = {
  id: string;
  usuarioId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
};

export type EquipoJuridicoDto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  miembros: EquipoJuridicoMiembroDto[];
  miembrosCount: number;
  createdAt: string;
  updatedAt: string;
};
