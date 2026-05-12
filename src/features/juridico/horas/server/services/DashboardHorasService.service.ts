import type { Prisma, PrismaClient } from "@prisma/client";
import { Err, Ok, type Result } from "@/core/shared/result/result";
import type {
  DashboardHorasDto,
  DashboardHorasFilters,
} from "../dtos/DashboardHorasDto.dto";

export class DashboardHorasService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardData(
    filters: DashboardHorasFilters
  ): Promise<Result<DashboardHorasDto, Error>> {
    try {
      const where: Prisma.RegistroHoraWhereInput = {};

      if (filters.ano) where.ano = filters.ano;
      if (filters.equipoJuridicoId) where.equipoJuridicoId = filters.equipoJuridicoId;
      if (filters.clienteJuridicoId) where.clienteJuridicoId = filters.clienteJuridicoId;

      if (filters.semanaDesde || filters.semanaHasta) {
        where.semana = {};
        if (filters.semanaDesde) where.semana.gte = filters.semanaDesde;
        if (filters.semanaHasta) where.semana.lte = filters.semanaHasta;
      }

      const registros = await this.prisma.registroHora.findMany({
        where,
        include: {
          equipoJuridico: { select: { nombre: true } },
          clienteJuridico: { select: { nombre: true } },
          asuntoJuridico: { select: { nombre: true } },
          usuario: { select: { name: true, email: true } },
        },
      });

      const totalHoras = registros.reduce((acc, item) => acc + Number(item.horas), 0);
      const totalRegistros = registros.length;
      const totalUsuarios = new Set(registros.map((item) => item.usuarioId)).size;
      const totalClientes = new Set(registros.map((item) => item.clienteJuridicoId)).size;

      const horasPorEquipoMap = new Map<string, { nombre: string; horas: number; registros: number }>();
      const horasPorClienteMap = new Map<string, { nombre: string; horas: number; registros: number }>();
      const horasPorAsuntoMap = new Map<
        string,
        { nombre: string; clienteNombre: string; horas: number; registros: number }
      >();
      const horasPorUsuarioMap = new Map<
        string,
        { nombre: string; email: string; horas: number; registros: number }
      >();
      const horasPorSemanaMap = new Map<string, { semana: number; ano: number; horas: number; registros: number }>();

      registros.forEach((registro) => {
        const horas = Number(registro.horas);

        const equipoPrev = horasPorEquipoMap.get(registro.equipoJuridicoId) ?? {
          nombre: registro.equipoJuridico.nombre,
          horas: 0,
          registros: 0,
        };
        equipoPrev.horas += horas;
        equipoPrev.registros += 1;
        horasPorEquipoMap.set(registro.equipoJuridicoId, equipoPrev);

        const clientePrev = horasPorClienteMap.get(registro.clienteJuridicoId) ?? {
          nombre: registro.clienteJuridico.nombre,
          horas: 0,
          registros: 0,
        };
        clientePrev.horas += horas;
        clientePrev.registros += 1;
        horasPorClienteMap.set(registro.clienteJuridicoId, clientePrev);

        const asuntoPrev = horasPorAsuntoMap.get(registro.asuntoJuridicoId) ?? {
          nombre: registro.asuntoJuridico.nombre,
          clienteNombre: registro.clienteJuridico.nombre,
          horas: 0,
          registros: 0,
        };
        asuntoPrev.horas += horas;
        asuntoPrev.registros += 1;
        horasPorAsuntoMap.set(registro.asuntoJuridicoId, asuntoPrev);

        const usuarioPrev = horasPorUsuarioMap.get(registro.usuarioId) ?? {
          nombre: registro.usuario.name,
          email: registro.usuario.email,
          horas: 0,
          registros: 0,
        };
        usuarioPrev.horas += horas;
        usuarioPrev.registros += 1;
        horasPorUsuarioMap.set(registro.usuarioId, usuarioPrev);

        const semanaKey = `${registro.ano}-${registro.semana}`;
        const semanaPrev = horasPorSemanaMap.get(semanaKey) ?? {
          semana: registro.semana,
          ano: registro.ano,
          horas: 0,
          registros: 0,
        };
        semanaPrev.horas += horas;
        semanaPrev.registros += 1;
        horasPorSemanaMap.set(semanaKey, semanaPrev);
      });

      return Ok({
        totalHoras,
        totalRegistros,
        totalUsuarios,
        totalClientes,
        horasPorEquipo: Array.from(horasPorEquipoMap.values()).sort((a, b) => b.horas - a.horas),
        horasPorCliente: Array.from(horasPorClienteMap.values()).sort((a, b) => b.horas - a.horas),
        horasPorAsunto: Array.from(horasPorAsuntoMap.values()).sort((a, b) => b.horas - a.horas),
        horasPorUsuario: Array.from(horasPorUsuarioMap.values()).sort((a, b) => b.horas - a.horas),
        horasPorSemana: Array.from(horasPorSemanaMap.values()).sort((a, b) =>
          a.ano === b.ano ? a.semana - b.semana : a.ano - b.ano
        ),
      });
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Error al obtener dashboard de horas"));
    }
  }
}
