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
 * NOTE: the canonical type now lives in
 * `@/features/RecursosHumanos/colaboradores/server/dtos/VacationBalanceDto.dto.ts`
 * (introduced in P6 — see `VacationBalanceService`). The dedicated
 * `findVacationBalance` repo method was removed in P6 since the new service
 * owns its own repo (`PrismaVacationBalanceRepository`) for the 1:1
 * upsert/read surface.
 */

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
   * Build the raw rows for the Organigrama tree (cap7 req1).
   *
   * Returns ALL colaboradores with `select` only on the fields needed by the
   * tree (id, name, correo, puesto, status, socioId) — no join on `socio`
   * here on purpose; the socio display name is resolved client-side via the
   * `Socio` table which the orchestrator pre-fetches via `getAllSocios`.
   *
   * The grouping + bucket rendering happens in the service layer
   * (`ColaboradorService.getOrgTreeBySocio`); this repo method just returns
   * the flat dataset the service needs.
   */
  findForOrgTree(): Promise<
    {
      id: string;
      name: string;
      correo: string;
      puesto: string;
      status: ColaboradorEstado;
      socioId: string | null;
    }[]
  >;
}
