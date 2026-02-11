import { Socio } from "@prisma/client";

export type SocioEntity = Socio;

export type CreateSocioArgs = {
  nombre: string;
  email: string;
  telefono?: string | null;
  activo: boolean;
  fechaIngreso: Date;
  departamento?: string | null;
  notas?: string | null;
};

export type UpdateSocioArgs = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  activo: boolean;
  fechaIngreso: Date;
  departamento?: string | null;
  notas?: string | null;
};

export interface SocioRepository {
  create(data: CreateSocioArgs): Promise<SocioEntity>;
  update(data: UpdateSocioArgs): Promise<SocioEntity>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<SocioEntity | null>;
  findByEmail(data: { email: string }): Promise<boolean>;
  getAll(): Promise<SocioEntity[]>;
  getAllColaboradoresBySocioId(
    socioId: string,
  ): Promise<{ correo: string; name: string; id: string }[] | undefined>;
  countColaboradores(data: { id: string }): Promise<number>;
  getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<{ data: SocioEntity[]; totalCount: number }>;
}
