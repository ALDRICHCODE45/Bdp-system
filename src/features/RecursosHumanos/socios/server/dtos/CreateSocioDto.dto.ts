export type CreateSocioDto = {
  nombre: string;
  email: string;
  telefono?: string | null;
  activo: boolean;
  fechaIngreso: Date;
  departamento?: string | null;
  notas?: string | null;
};
