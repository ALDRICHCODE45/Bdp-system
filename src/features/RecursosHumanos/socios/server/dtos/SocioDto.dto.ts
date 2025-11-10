export type SocioDto = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  fechaIngreso: string;
  departamento: string | null;
  numeroEmpleados: number;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
};
