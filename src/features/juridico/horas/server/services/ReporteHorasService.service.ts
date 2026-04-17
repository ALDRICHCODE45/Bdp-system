import type { PrismaClient, Prisma } from "@prisma/client";
import { Ok, Err, type Result } from "@/core/shared/result/result";
import type {
  ReporteHorasFilters,
  ReporteHorasResumenDto,
  ReporteHorasRowDto,
} from "../dtos/ReporteHorasDto.dto";

export class ReporteHorasService {
  constructor(private prisma: PrismaClient) {}

  async getReporte(
    filters: ReporteHorasFilters
  ): Promise<Result<ReporteHorasResumenDto, Error>> {
    try {
      // Build where clause dynamically
      const where: Prisma.RegistroHoraWhereInput = {};

      if (filters.equipoJuridicoId) where.equipoJuridicoId = filters.equipoJuridicoId;
      if (filters.clienteJuridicoId) where.clienteJuridicoId = filters.clienteJuridicoId;
      if (filters.asuntoJuridicoId) where.asuntoJuridicoId = filters.asuntoJuridicoId;
      if (filters.socioId) where.socioId = filters.socioId;
      if (filters.usuarioId) where.usuarioId = filters.usuarioId;
      if (filters.ano) where.ano = filters.ano;

      // For semana range filter
      if (filters.semanaDesde || filters.semanaHasta) {
        where.semana = {};
        if (filters.semanaDesde) where.semana.gte = filters.semanaDesde;
        if (filters.semanaHasta) where.semana.lte = filters.semanaHasta;
      }

      const registros = await this.prisma.registroHora.findMany({
        where,
        include: {
          usuario: { select: { id: true, name: true, email: true } },
          equipoJuridico: { select: { id: true, nombre: true } },
          clienteJuridico: { select: { id: true, nombre: true } },
          asuntoJuridico: { select: { id: true, nombre: true } },
          socio: { select: { id: true, nombre: true } },
        },
        orderBy: [{ ano: "desc" }, { semana: "desc" }, { createdAt: "desc" }],
      });

      const rows: ReporteHorasRowDto[] = registros.map((r) => ({
        id: r.id,
        usuarioNombre: r.usuario.name,
        usuarioEmail: r.usuario.email,
        equipoNombre: r.equipoJuridico.nombre,
        clienteNombre: r.clienteJuridico.nombre,
        asuntoNombre: r.asuntoJuridico.nombre,
        socioNombre: r.socio.nombre,
        horas: Number(r.horas),
        descripcion: r.descripcion,
        ano: r.ano,
        semana: r.semana,
        createdAt: r.createdAt.toISOString(),
      }));

      const totalHoras = rows.reduce((sum, r) => sum + r.horas, 0);

      return Ok({
        totalHoras,
        totalRegistros: rows.length,
        rows,
      });
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al generar reporte")
      );
    }
  }
}
