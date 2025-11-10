import { ColaboradorEstado } from "@prisma/client";

export type CreateColaboradorDto = {
  name: string;
  correo: string;
  puesto: string;
  status: ColaboradorEstado;
  imss: boolean;
  socioId?: string | null;
  banco: string;
  clabe: string;
  sueldo: number;
  activos: string[];
};

