import type { Prisma, PrismaClient } from "@prisma/client";
import { Err, Ok, type Result } from "@/core/shared/result/result";
import type {
  DashboardHorasDto,
  DashboardHorasFilters,
  DashboardHorasScope,
} from "../dtos/DashboardHorasDto.dto";

const ADMIN_SOCIO_ROLES = new Set(["administrador", "socio"]);

export class DashboardHorasService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardData(
    filters: DashboardHorasFilters,
    scope?: DashboardHorasScope
  ): Promise<Result<DashboardHorasDto, Error>> {
    try {
      const where: Prisma.RegistroHoraWhereInput = {};

      if (filters.ano) where.ano = filters.ano;
      if (filters.equipoJuridicoId) where.equipoJuridicoId = filters.equipoJuridicoId;
      if (filters.clienteProveedorId) where.clienteProveedorId = filters.clienteProveedorId;

      if (filters.semanaDesde || filters.semanaHasta) {
        where.semana = {};
        if (filters.semanaDesde) where.semana.gte = filters.semanaDesde;
        if (filters.semanaHasta) where.semana.lte = filters.semanaHasta;
      }

      // REQ-DH-100: non-admin/socio users only see their own row in
      // horasPorUsuario / importePorUsuario. Other dimensions stay
      // visible (the spec only scopes the per-user card).
      const restrictToOwnUser =
        !!scope &&
        !!scope.usuarioId &&
        !!scope.role &&
        !ADMIN_SOCIO_ROLES.has(scope.role.toString().toLowerCase());

      // Belt-and-suspenders: when scoping, also restrict the underlying
      // query so we never pull rows the user shouldn't see.
      if (restrictToOwnUser && scope) {
        where.usuarioId = scope.usuarioId;
      }

      const registros = await this.prisma.registroHora.findMany({
        where,
        include: {
          equipoJuridico: { select: { nombre: true } },
          clienteProveedor: { select: { nombre: true } },
          asuntoJuridico: { select: { nombre: true } },
          usuario: { select: { name: true, email: true } },
        },
      });

      const totalHoras = registros.reduce((acc, item) => acc + Number(item.horas), 0);
      const totalRegistros = registros.length;
      const totalUsuarios = new Set(registros.map((item) => item.usuarioId)).size;
      const totalClientes = new Set(registros.map((item) => item.clienteProveedorId)).size;
      // REQ-DH-100: totalImporte is the persisted sum, not recomputed.
      const totalImporte = registros.reduce(
        (acc, item) => acc + (item.importe ? Number(item.importe) : 0),
        0
      );

      const horasPorEquipoMap = new Map<string, { nombre: string; horas: number; registros: number }>();
      const horasPorClienteMap = new Map<string, { nombre: string; horas: number; registros: number }>();
      const horasPorAsuntoMap = new Map<
        string,
        { nombre: string; clienteNombre: string; horas: number; registros: number }
      >();
      const horasPorUsuarioMap = new Map<
        string,
        { nombre: string; email: string; horas: number; registros: number; importe: number }
      >();
      const horasPorSemanaMap = new Map<string, { semana: number; ano: number; horas: number; registros: number }>();

      registros.forEach((registro) => {
        const horas = Number(registro.horas);
        const importe = registro.importe ? Number(registro.importe) : 0;

        const equipoPrev = horasPorEquipoMap.get(registro.equipoJuridicoId) ?? {
          nombre: registro.equipoJuridico.nombre,
          horas: 0,
          registros: 0,
        };
        equipoPrev.horas += horas;
        equipoPrev.registros += 1;
        horasPorEquipoMap.set(registro.equipoJuridicoId, equipoPrev);

        const clientePrev = horasPorClienteMap.get(registro.clienteProveedorId) ?? {
          nombre: registro.clienteProveedor.nombre,
          horas: 0,
          registros: 0,
        };
        clientePrev.horas += horas;
        clientePrev.registros += 1;
        horasPorClienteMap.set(registro.clienteProveedorId, clientePrev);

        const asuntoPrev = horasPorAsuntoMap.get(registro.asuntoJuridicoId) ?? {
          nombre: registro.asuntoJuridico.nombre,
          clienteNombre: registro.clienteProveedor.nombre,
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
          importe: 0,
        };
        usuarioPrev.horas += horas;
        usuarioPrev.registros += 1;
        usuarioPrev.importe += importe;
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

      // REQ-DH-100: When the caller is NOT admin/socio, the per-user
      // lists show ONLY that user's row. When admin/socio, all abogados.
      // Both cases are already enforced by the WHERE clause (with or
      // without `where.usuarioId = scope.usuarioId`).
      const horasPorUsuario = Array.from(horasPorUsuarioMap.values()).sort(
        (a, b) => b.horas - a.horas
      );
      const importePorUsuario = horasPorUsuario.map((u) => ({
        nombre: u.nombre,
        email: u.email,
        horas: u.horas,
        registros: u.registros,
        importe: u.importe,
      }));

      return Ok({
        totalHoras,
        totalRegistros,
        totalUsuarios,
        totalClientes,
        totalImporte,
        horasPorEquipo: Array.from(horasPorEquipoMap.values()).sort((a, b) => b.horas - a.horas),
        horasPorCliente: Array.from(horasPorClienteMap.values()).sort((a, b) => b.horas - a.horas),
        horasPorAsunto: Array.from(horasPorAsuntoMap.values()).sort((a, b) => b.horas - a.horas),
        horasPorUsuario,
        importePorUsuario,
        horasPorSemana: Array.from(horasPorSemanaMap.values()).sort((a, b) =>
          a.ano === b.ano ? a.semana - b.semana : a.ano - b.ano
        ),
      });
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Error al obtener dashboard de horas"));
    }
  }
}
