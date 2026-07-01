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
  VacationBalanceRead,
} from "../repositories/ColaboradorRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { ColaboradorHistorialService } from "./ColaboradorHistorialService.service";

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
   * Read-only fetch of a colaborador's VacationBalance row.
   *
   * Returns `Result.ok(null)` when no balance has been registered — the UI
   * renders that as "Sin registrar" (spec cap3 req4, NEVER 0/0). The shape
   * stays a typed POJO (no Prisma leak past the repo boundary, CC7).
   */
  async getVacationBalance(
    colaboradorId: string
  ): Promise<Result<VacationBalanceRead | null, Error>> {
    try {
      const balance = await this.colaboradorRepository.findVacationBalance({
        colaboradorId,
      });
      return Ok(balance);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener balance de vacaciones")
      );
    }
  }
}
