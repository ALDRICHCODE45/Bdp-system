import {
  Colaborador,
  ColaboradorEstado,
  ModalidadTrabajo,
  NivelSeniority,
  Prisma,
  TipoContrato,
} from "@prisma/client";

export type ColaboradorWithSocio = Colaborador & {
  socio: {
    id: string;
    nombre: string;
    email: string;
  } | null;
};

export type CreateColaboradorArgs = {
  name: string;
  correo: string;
  puesto: string;
  status: ColaboradorEstado;
  imss: boolean;
  socioId?: string | null;
  banco: string;
  clabe: string;
  sueldo: Prisma.Decimal | number;
  activos: string[];
  // Perfil extendido (rh-colaboradores-completo · P0 — todos opcionales/nullable)
  departamento?: string | null;
  nivel?: NivelSeniority | null;
  modalidad?: ModalidadTrabajo | null;
  tipoContrato?: TipoContrato | null;
  lugarTrabajo?: string | null;
  horario?: string | null;
  fechaSalida?: Date | null;
  nombrePreferido?: string | null;
  documentoIdentidad?: string | null;
  emailPersonal?: string | null;
  bio?: string | null;
};

export type UpdateColaboradorArgs = {
  id: string;
  name: string;
  correo: string;
  puesto: string;
  status: ColaboradorEstado;
  imss: boolean;
  socioId?: string | null;
  banco: string;
  clabe: string;
  sueldo: Prisma.Decimal | number;
  activos: string[];
  // Datos personales
  fechaIngreso?: Date;
  genero?: string | null;
  fechaNacimiento?: Date | null;
  nacionalidad?: string | null;
  estadoCivil?: string | null;
  tipoSangre?: string | null;
  // Contacto y dirección
  direccion?: string | null;
  telefono?: string | null;
  // Datos fiscales
  rfc?: string | null;
  curp?: string | null;
  // Académicos y laborales previos
  ultimoGradoEstudios?: string | null;
  escuela?: string | null;
  ultimoTrabajo?: string | null;
  // Referencias personales
  nombreReferenciaPersonal?: string | null;
  telefonoReferenciaPersonal?: string | null;
  parentescoReferenciaPersonal?: string | null;
  // Referencias laborales
  nombreReferenciaLaboral?: string | null;
  telefonoReferenciaLaboral?: string | null;
  // Perfil extendido (rh-colaboradores-completo · P0 — todos opcionales/nullable)
  departamento?: string | null;
  nivel?: NivelSeniority | null;
  modalidad?: ModalidadTrabajo | null;
  tipoContrato?: TipoContrato | null;
  lugarTrabajo?: string | null;
  horario?: string | null;
  fechaSalida?: Date | null;
  nombrePreferido?: string | null;
  documentoIdentidad?: string | null;
  emailPersonal?: string | null;
  bio?: string | null;
};

/**
 * Read-only POJO for a Colaborador's VacationBalance row.
 *
 * Decoupled from the Prisma model so the service→DTO boundary does not leak
 * Prisma types (CC7). The full row is small + flat, so a typed shape is enough.
 */
export type VacationBalanceRead = {
  colaboradorId: string;
  diasDisponibles: number;
  diasTomados: number;
};

export interface ColaboradorRepository {
  create(data: CreateColaboradorArgs): Promise<ColaboradorWithSocio>;
  update(data: UpdateColaboradorArgs): Promise<ColaboradorWithSocio>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<ColaboradorWithSocio | null>;
  findByCorreo(data: { correo: string }): Promise<ColaboradorWithSocio | null>;
  getAll(): Promise<ColaboradorWithSocio[]>;
  findBySocioId(data: { socioId: string }): Promise<ColaboradorWithSocio[]>;
  getPaginated(
    params: import("@/features/RecursosHumanos/colaboradores/types/ColaboradoresFilterParams").ColaboradoresFilterParams
  ): Promise<{ data: ColaboradorWithSocio[]; totalCount: number }>;
  /** Count rows per status (single groupBy). Used for tab badges. */
  countByStatus(): Promise<{
    CONTRATADO: number;
    DESPEDIDO: number;
    EN_LICENCIA: number;
  }>;
  /**
   * Count colaboradores that report to the same socio. Returns 0 when
   * `socioId` is null (spec cap3 req5 — a colaborador without a socio has no
   * "reportes directos" by definition).
   */
  countBySocioId(data: { socioId: string | null }): Promise<number>;
  /**
   * Find the VacationBalance row for a colaborador (1:1). Returns null when
   * no balance has been registered (spec cap3 req4 → "Sin registrar", NOT 0/0).
   */
  findVacationBalance(data: {
    colaboradorId: string;
  }): Promise<VacationBalanceRead | null>;
}
