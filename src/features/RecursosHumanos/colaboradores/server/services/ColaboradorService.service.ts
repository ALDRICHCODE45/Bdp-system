import {
  ColaboradorEstado,
  ModalidadTrabajo,
  NivelSeniority,
  Prisma,
  PrismaClient,
  TipoContrato,
} from "@prisma/client";
import {
  ColaboradorRepository,
  ColaboradorWithSocio,
} from "../repositories/ColaboradorRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { ColaboradorHistorialService } from "./ColaboradorHistorialService.service";
import type {
  OrgTreeDto,
  OrgTreeNode,
} from "../dtos/OrgTreeDto.dto";

/**
 * Detects a position change between the previously-fetched `before` snapshot
 * and the freshly-updated `after` snapshot. The three fields tracked by
 * ColaboradorPositionHistory (cargo, departamento, nivel) are compared with
 * strict equality + null-safe normalization.
 *
 * Spec cap5 req6: "Position changes (cargo, departamento, nivel) MUST append
 * a PositionHistory entry in the same transaction as the Colaborador update."
 */
function hasPositionChanged(
  before: ColaboradorWithSocio,
  after: ColaboradorWithSocio
): boolean {
  if (before.puesto !== after.puesto) return true;
  const beforeDept = before.departamento ?? null;
  const afterDept = after.departamento ?? null;
  if (beforeDept !== afterDept) return true;
  if ((before.nivel ?? null) !== (after.nivel ?? null)) return true;
  return false;
}

type CreateColaboradorInput = {
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
  usuarioId?: string | null;
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

type UpdateColaboradorInput = {
  id: string;
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
  usuarioId?: string | null;
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

export class ColaboradorService {
  constructor(
    private colaboradorRepository: ColaboradorRepository,
    private historialService: ColaboradorHistorialService,
    private prisma: PrismaClient
  ) {}

  async create(
    input: CreateColaboradorInput
  ): Promise<Result<ColaboradorWithSocio, Error>> {
    try {
      // Validar que el correo no exista
      const existingColaborador = await this.colaboradorRepository.findByCorreo(
        {
          correo: input.correo,
        }
      );

      if (existingColaborador) {
        return Err(new Error("Ya existe un colaborador con ese correo"));
      }

      const colaborador = await this.colaboradorRepository.create({
        name: input.name,
        correo: input.correo,
        puesto: input.puesto,
        status: input.status,
        imss: input.imss,
        socioId: input.socioId,
        banco: input.banco,
        clabe: input.clabe,
        sueldo: new Prisma.Decimal(input.sueldo),
        activos: input.activos,
        // Perfil extendido (rh-colaboradores-completo · P0)
        departamento: input.departamento,
        nivel: input.nivel,
        modalidad: input.modalidad,
        tipoContrato: input.tipoContrato,
        lugarTrabajo: input.lugarTrabajo,
        horario: input.horario,
        fechaSalida: input.fechaSalida,
        nombrePreferido: input.nombrePreferido,
        documentoIdentidad: input.documentoIdentidad,
        emailPersonal: input.emailPersonal,
        bio: input.bio,
      });

      // Crear historial para el nuevo colaborador
      const historialResult =
        await this.historialService.createHistorialForNewColaborador(
          colaborador,
          input.usuarioId
        );

      if (!historialResult.ok) {
        // Si falla la creación del historial, no fallar la creación del colaborador
        // pero registrar el error
        console.error(
          "Error al crear historial para nuevo colaborador:",
          historialResult.error
        );
      }

      return Ok(colaborador);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al crear colaborador")
      );
    }
  }

  async update(
    input: UpdateColaboradorInput
  ): Promise<Result<ColaboradorWithSocio, Error>> {
    try {
      // Verificar que el colaborador existe
      const existingColaborador = await this.colaboradorRepository.findById({
        id: input.id,
      });

      if (!existingColaborador) {
        return Err(new Error("Colaborador no encontrado"));
      }

      // Usar transacción para actualizar colaborador y crear historial de forma atómica
      const result = await this.prisma.$transaction(async (tx) => {
        // Crear repositorio temporal con el cliente de transacción
        const { PrismaColaboradorRepository } = await import(
          "../repositories/PrismaColaboradorRepository.repository"
        );
        const { PrismaColaboradorHistorialRepository } = await import(
          "../repositories/PrismaColaboradorHistorialRepository.repository"
        );
        const { ColaboradorHistorialService } = await import(
          "./ColaboradorHistorialService.service"
        );

        const tempColaboradorRepository = new PrismaColaboradorRepository(tx);
        const tempHistorialRepository =
          new PrismaColaboradorHistorialRepository(tx);
        const tempHistorialService = new ColaboradorHistorialService(
          tempHistorialRepository
        );

        // Actualizar colaborador
        const updatedColaborador = await tempColaboradorRepository.update({
          id: input.id,
          name: input.name,
          correo: input.correo,
          puesto: input.puesto,
          status: input.status,
          imss: input.imss,
          socioId: input.socioId,
          banco: input.banco,
          clabe: input.clabe,
          sueldo: new Prisma.Decimal(input.sueldo),
          activos: input.activos,
          // Datos personales
          fechaIngreso: input.fechaIngreso,
          genero: input.genero,
          fechaNacimiento: input.fechaNacimiento,
          nacionalidad: input.nacionalidad,
          estadoCivil: input.estadoCivil,
          tipoSangre: input.tipoSangre,
          // Contacto y dirección
          direccion: input.direccion,
          telefono: input.telefono,
          // Datos fiscales
          rfc: input.rfc,
          curp: input.curp,
          // Académicos y laborales previos
          ultimoGradoEstudios: input.ultimoGradoEstudios,
          escuela: input.escuela,
          ultimoTrabajo: input.ultimoTrabajo,
          // Referencias personales
          nombreReferenciaPersonal: input.nombreReferenciaPersonal,
          telefonoReferenciaPersonal: input.telefonoReferenciaPersonal,
          parentescoReferenciaPersonal: input.parentescoReferenciaPersonal,
          // Referencias laborales
          nombreReferenciaLaboral: input.nombreReferenciaLaboral,
          telefonoReferenciaLaboral: input.telefonoReferenciaLaboral,
          // Perfil extendido (rh-colaboradores-completo · P0)
          departamento: input.departamento,
          nivel: input.nivel,
          modalidad: input.modalidad,
          tipoContrato: input.tipoContrato,
          lugarTrabajo: input.lugarTrabajo,
          horario: input.horario,
          fechaSalida: input.fechaSalida,
          nombrePreferido: input.nombrePreferido,
          documentoIdentidad: input.documentoIdentidad,
          emailPersonal: input.emailPersonal,
          bio: input.bio,
        });

        // Crear historial para los cambios
        const historialResult =
          await tempHistorialService.createHistorialForUpdate(
            existingColaborador,
            updatedColaborador,
            input.usuarioId
          );

        if (!historialResult.ok) {
          throw new Error(
            `Error al crear historial: ${historialResult.error.message}`
          );
        }

        // ── Posición: append a ColaboradorPositionHistory row when the
        // position-related fields changed (CC5 / cap5 req6 / cap6 req5).
        //
        // We do this INSIDE the same $transaction as the Colaborador update
        // so the two writes commit atomically. Any throw here propagates to
        // the $transaction callback and triggers a full rollback — neither
        // the Colaborador row nor a PositionHistory row leaks out as a
        // partial write when validation/insertion fails downstream.
        //
        // The history captures the PREVIOUS cargo/departamento/nivel values
        // (i.e., the snapshot BEFORE the update), with fechaEfectiva = now.
        // We rely on `?? null` semantics so nullable fields stay nullable.
        if (hasPositionChanged(existingColaborador, updatedColaborador)) {
          await tx.colaboradorPositionHistory.create({
            data: {
              colaboradorId: input.id,
              fechaEfectiva: new Date(),
              cargo: existingColaborador.puesto,
              departamento: existingColaborador.departamento ?? null,
              nivel: existingColaborador.nivel ?? null,
              motivo: null,
            },
          });
        }

        return updatedColaborador;
      });

      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar colaborador")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      // Verificar que el colaborador existe
      const existingColaborador = await this.colaboradorRepository.findById({
        id,
      });

      if (!existingColaborador) {
        return Err(new Error("Colaborador no encontrado"));
      }

      await this.colaboradorRepository.delete({ id });

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar colaborador")
      );
    }
  }

  async getById(id: string): Promise<Result<ColaboradorWithSocio, Error>> {
    try {
      const colaborador = await this.colaboradorRepository.findById({ id });

      if (!colaborador) {
        return Err(new Error("Colaborador no encontrado"));
      }

      return Ok(colaborador);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener colaborador")
      );
    }
  }

  async getAll(): Promise<Result<ColaboradorWithSocio[], Error>> {
    try {
      const colaboradores = await this.colaboradorRepository.getAll();
      return Ok(colaboradores);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener colaboradores")
      );
    }
  }

  async getBySocioId(
    socioId: string
  ): Promise<Result<ColaboradorWithSocio[], Error>> {
    try {
      const colaboradores = await this.colaboradorRepository.findBySocioId({
        socioId,
      });
      return Ok(colaboradores);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener colaboradores por socio")
      );
    }
  }

  async getPaginated(params: import("@/features/RecursosHumanos/colaboradores/types/ColaboradoresFilterParams").ColaboradoresFilterParams): Promise<Result<{ data: ColaboradorWithSocio[]; totalCount: number }, Error>> {
    try {
      const result = await this.colaboradorRepository.getPaginated(params);
      return Ok(result);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Error al obtener colaboradores paginados"));
    }
  }

  async countByStatus(): Promise<Result<{ CONTRATADO: number; DESPEDIDO: number; EN_LICENCIA: number }, Error>> {
    try {
      const counts = await this.colaboradorRepository.countByStatus();
      return Ok(counts);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al obtener conteos por estado"),
      );
    }
  }

  /**
   * Count colaboradores that report to the same socio.
   *
   * Spec cap3 req5: MUST equal the number of colaboradores sharing `socioId`;
   * MUST be 0 when `socioId` is null. The count is computed server-side and
   * returned as a plain number — the client KPI card never derives it.
   */
  async getReportesDirectos(
    socioId: string | null
  ): Promise<Result<number, Error>> {
    try {
      const count = await this.colaboradorRepository.countBySocioId({
        socioId,
      });
      return Ok(count);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener reportes directos")
      );
    }
  }

  /**
   * Build the 2-level Organigrama tree (cap7 req1).
   *
   * Groups every colaborador by `socioId` and produces one `OrgTreeNode` per
   * bucket:
   *
   * - One bucket per existing Socio (with display name resolved via a single
   *   batched `socio.findMany` lookup).
   * - An additional "Sin socio asignado" bucket when at least one
   *   colaborador has `socioId === null` (cap7 req3 scenario).
   *
   * The current colaborador's own bucket is flagged with `isCurrentBucket =
   * true` so the UI can mark the relevant node (cap7 req2). Collaboradores
   * with no `socioId` fall into the synthetic "Sin socio asignado" bucket —
   * this is exactly the case cap7 covers with the `socio FK onDelete: SetNull`
   * design: when a Socio is deleted, those colaboradores naturally roll into
   * the null bucket with no orphan / error.
   */
  async getOrgTreeBySocio(
    currentColaboradorId: string
  ): Promise<Result<OrgTreeDto, Error>> {
    try {
      // Look up the current colaborador first so we know which bucket to
      // flag. This is a single-row read; if the id is stale we return the
      // not-found error rather than producing a misflagged tree.
      const current = await this.colaboradorRepository.findById({
        id: currentColaboradorId,
      });
      if (!current) {
        return Err(new Error("Colaborador no encontrado"));
      }

      const [rows, socios] = await Promise.all([
        this.colaboradorRepository.findForOrgTree(),
        this.prisma.socio.findMany({
          select: { id: true, nombre: true, email: true },
          orderBy: { nombre: "asc" },
        }),
      ]);

      // Bucket colaboradores by socioId (string|null).
      const buckets = new Map<string | null, typeof rows>();
      for (const row of rows) {
        const key = row.socioId ?? null;
        const existing = buckets.get(key);
        if (existing) {
          existing.push(row);
        } else {
          buckets.set(key, [row]);
        }
      }

      const currentSocioKey = current.socioId ?? null;
      const nodes: OrgTreeNode[] = [];

      // One node per known socio, in socio.nombre order (already ordered by
      // the findMany above). We include the bucket even if it's empty AFTER
      // filtering out the current row, to keep the tree stable across
      // navigation; but in practice every socio referenced has at least one
      // colaborador (FK constraint), so the count is always >= 1 here.
      for (const socio of socios) {
        const colaboradores = buckets.get(socio.id) ?? [];
        if (colaboradores.length === 0) continue;
        nodes.push({
          socioId: socio.id,
          label: socio.nombre,
          subLabel: socio.email,
          count: colaboradores.length,
          colaboradores: colaboradores.map((c) => ({
            id: c.id,
            name: c.name,
            correo: c.correo,
            puesto: c.puesto,
            status: c.status,
          })),
          isCurrentBucket: socio.id === currentSocioKey,
        });
      }

      // Synthetic bucket for null socioId — labelled "Sin socio asignado"
      // (cap7 req3 wording). Sorted AFTER the named-socio nodes so the
      // current colaborador's own bucket (when their socioId is null) lands
      // at the bottom; the UI flags it via isCurrentBucket regardless of
      // position.
      const nullBucket = buckets.get(null) ?? [];
      if (nullBucket.length > 0) {
        nodes.push({
          socioId: null,
          label: "Sin socio asignado",
          subLabel: "",
          count: nullBucket.length,
          colaboradores: nullBucket.map((c) => ({
            id: c.id,
            name: c.name,
            correo: c.correo,
            puesto: c.puesto,
            status: c.status,
          })),
          isCurrentBucket: currentSocioKey === null,
        });
      }

      return Ok({
        currentColaboradorId,
        nodes,
      });
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener el organigrama")
      );
    }
  }
}
