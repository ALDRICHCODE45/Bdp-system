export type ColaboradorDto = {
  id: string;
  name: string;
  correo: string;
  puesto: string;
  status: string; // ColaboradorEstado serializado como string
  imss: boolean;
  socioId: string | null;
  socio: {
    id: string;
    nombre: string;
    email: string;
  } | null;
  banco: string;
  clabe: string;
  sueldo: string; // Decimal as string para el frontend
  activos: string[];
  createdAt: string;
  updatedAt: string;
};
