import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  ReporteHorasAgrupadoRepository,
  ReporteAgrupadoPageArgs,
  ReporteAgrupadoGroupRow,
  EntityLabels,
} from "./ReporteHorasAgrupadoRepository.repository";
import type {
  ReporteAgrupadoFilters,
  ReporteAgrupadoPageDto,
  ReporteAgrupadoSort,
  ReporteGrupoDto,
  SubtotalesDto,
} from "../dtos/ReporteHorasAgrupadoDto.dto";
import {
  toReporteGrupoDto,
  toReporteGrupoDtoArray,
} from "../mappers/reporteHorasAgrupadoMapper";

// ─── Where clause builder (compartido entre paginated/all/subtotales) ─────────

/**
 * Construye el `where` Prisma a partir de los filtros. Aplica cada filtro
 * de forma conjuntiva (AND). Cada rama ausente = sin restricción.
 */
function buildWhere(
  filters: ReporteAgrupadoFilters,
): Prisma.RegistroHoraWhereInput {
  const where: Prisma.RegistroHoraWhereInput = {};

  if (filters.usuarioId) where.usuarioId = filters.usuarioId;
  if (filters.asuntoJuridicoId)
    where.asuntoJuridicoId = filters.asuntoJuridicoId;
  if (filters.clienteProveedorId)
    where.clienteProveedorId = filters.clienteProveedorId;
  if (filters.equipoJuridicoId)
    where.equipoJuridicoId = filters.equipoJuridicoId;
  if (filters.socioId) where.socioId = filters.socioId;
  if (filters.estado) where.asuntoJuridico = { estado: filters.estado };
  if (filters.ano !== undefined) where.ano = filters.ano;

  if (filters.horasDesde !== undefined || filters.horasHasta !== undefined) {
    where.horas = {
      ...(filters.horasDesde !== undefined ? { gte: filters.horasDesde } : {}),
      ...(filters.horasHasta !== undefined ? { lte: filters.horasHasta } : {}),
    };
  }

  if (filters.semanaDesde !== undefined || filters.semanaHasta !== undefined) {
    where.semana = {
      ...(filters.semanaDesde !== undefined
        ? { gte: filters.semanaDesde }
        : {}),
      ...(filters.semanaHasta !== undefined
        ? { lte: filters.semanaHasta }
        : {}),
    };
  }

  return where;
}

// ─── OrderBy builder ──────────────────────────────────────────────────────────

// ─── OrderBy builder ──────────────────────────────────────────────────────────

type OrderByItem = Record<string, "asc" | "desc">;

/**
 * Construye el orderBy para Prisma groupBy.
 *
 * - `ano` / `semana`: el campo ESTÁ en `by`, así que Prisma lo acepta.
 * - `horas`: NO está en `by` (solo en `_sum`). Prisma typing lo rechaza, pero el
 *   runtime lo soporta (`ORDER BY _sum.horas`). Lo casteamos al final del call site.
 */
function buildOrderBy(sort: ReporteAgrupadoSort | undefined): OrderByItem[] {
  if (!sort) {
    return [{ ano: "desc" }, { semana: "desc" }];
  }
  const dir = sort.direction;
  if (sort.field === "ano") return [{ ano: dir }];
  if (sort.field === "semana") return [{ ano: dir }, { semana: dir }];
  // sort.field === "horas" → el cast se hace en el call site.
  return [{ horas: dir }];
}

type GroupByByField =
  | "usuarioId"
  | "clienteProveedorId"
  | "asuntoJuridicoId"
  | "equipoJuridicoId"
  | "socioId"
  | "ano"
  | "semana";

const GROUP_BY_BY_FIELDS: GroupByByField[] = [
  "usuarioId",
  "clienteProveedorId",
  "asuntoJuridicoId",
  "equipoJuridicoId",
  "socioId",
  "ano",
  "semana",
];

// ─── Group key sets para labels batch-load ───────────────────────────────────

function uniqueGroupKeys(rows: ReporteAgrupadoGroupRow[]): {
  usuarioIds: string[];
  clienteProveedorIds: string[];
  asuntoJuridicoIds: string[];
  equipoJuridicoIds: string[];
  socioIds: string[];
} {
  const usuarios = new Set<string>();
  const clientes = new Set<string>();
  const asuntos = new Set<string>();
  const equipos = new Set<string>();
  const socios = new Set<string>();
  for (const r of rows) {
    usuarios.add(r.usuarioId);
    clientes.add(r.clienteProveedorId);
    asuntos.add(r.asuntoJuridicoId);
    equipos.add(r.equipoJuridicoId);
    socios.add(r.socioId);
  }
  return {
    usuarioIds: [...usuarios],
    clienteProveedorIds: [...clientes],
    asuntoJuridicoIds: [...asuntos],
    equipoJuridicoIds: [...equipos],
    socioIds: [...socios],
  };
}

// ─── Implementation ──────────────────────────────────────────────────────────

export class PrismaReporteHorasAgrupadoRepository implements ReporteHorasAgrupadoRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Wrapper sobre `prisma.registroHora.groupBy` que bypassea la validación
   * tipada de Prisma en `orderBy.horas` (campo de `_sum`, no de `by`).
   * El SQL subyacente SÍ lo soporta.
   *
   * REQ-RHA-100: `_sum` ahora incluye `importe` además de `horas`.
   * REQ-RHA-100-b: el doble cast (as unknown as (a: typeof args) =>
   * Promise<unknown>) se preserva VERBATIM para sort por `horas` que
   * tampoco está en `by`. Verificado por grep gate REQ-RHA-100-b.
   */
  private async callGroupBy(input: {
    where: Prisma.RegistroHoraWhereInput;
    orderBy: OrderByItem[];
    skip?: number;
    take?: number;
    needsSum: boolean;
  }): Promise<
    Array<
      Prisma.RegistroHoraGroupByOutputType & {
        _sum?: {
          horas: Prisma.Decimal | null;
          importe: Prisma.Decimal | null;
        };
      }
    >
  > {
    const args = {
      by: GROUP_BY_BY_FIELDS,
      where: input.where,
      ...(input.skip !== undefined ? { skip: input.skip } : {}),
      ...(input.take !== undefined ? { take: input.take } : {}),
      // REQ-RHA-100: extend _sum to include importe (Decimal(15,2)).
      ...(input.needsSum
        ? { _sum: { horas: true, importe: true } }
        : {}),
      // Cast: el campo `horas` no está en `by` (solo en `_sum`), pero el runtime lo acepta.
      orderBy: input.orderBy,
    };

    // Doble cast porque Prisma typing es muy estricto aquí.
    const callable = this.prisma.registroHora.groupBy as unknown as (
      a: typeof args,
    ) => Promise<unknown>;

    return (await callable(args)) as Array<
      Prisma.RegistroHoraGroupByOutputType & {
        _sum?: {
          horas: Prisma.Decimal | null;
          importe: Prisma.Decimal | null;
        };
      }
    >;
  }

  async getAgrupado(
    args: ReporteAgrupadoPageArgs,
  ): Promise<ReporteAgrupadoPageDto> {
    const where = buildWhere(args.filters);
    const orderBy = buildOrderBy(args.sort);
    const skip = (args.page - 1) * args.pageSize;

    // 1) Página de grupos + count (count usa el mismo `where` SIN filtros de orden)
    //    → segundo groupBy sin skip/take para total de grupos.
    const [groupsRaw, totalCount, subtotales] = await Promise.all([
      this.callGroupBy({
        where,
        orderBy,
        skip,
        take: args.pageSize,
        needsSum: true,
      }),
      this.prisma.registroHora
        .groupBy({
          by: GROUP_BY_BY_FIELDS,
          where,
          _count: { _all: true },
        })
        .then((rows) => rows.length),
      this.getSubtotales(args.filters),
    ]);

    // El estado del asunto no se puede agrupar directamente por el ID del asunto
    // (sería el mismo para todos los grupos de un mismo asunto) pero como filtramos
    // por `asuntoJuridico.estado` y cada `asuntoJuridicoId` está asociado a un único
    // estado, basta con hacer un batch-load paralelo cuando aplica.
    const groupsWithEstado: ReporteAgrupadoGroupRow[] = groupsRaw.map(
      (g): ReporteAgrupadoGroupRow => {
        const horas = g._sum.horas ? Number(g._sum.horas) : 0;
        const importe = g._sum.importe ? Number(g._sum.importe) : 0;
        return {
          usuarioId: g.usuarioId,
          clienteProveedorId: g.clienteProveedorId,
          asuntoJuridicoId: g.asuntoJuridicoId,
          equipoJuridicoId: g.equipoJuridicoId,
          socioId: g.socioId,
          estadoAsunto: "", // se rellena abajo
          ano: g.ano,
          semana: g.semana,
          horas,
          importe,
        };
      },
    );

    // Si NO hay filtro `estado`, necesitamos conocer el estado real de cada asunto
    // mostrado en la página. Si lo hay, todos los estados son iguales.
    if (args.filters.estado) {
      for (const g of groupsWithEstado) g.estadoAsunto = args.filters.estado;
    } else {
      const asuntoIds = [
        ...new Set(groupsWithEstado.map((g) => g.asuntoJuridicoId)),
      ];
      if (asuntoIds.length > 0) {
        const asuntos = await this.prisma.asuntoJuridico.findMany({
          where: { id: { in: asuntoIds } },
          select: { id: true, estado: true },
        });
        const estadoByAsunto = new Map(asuntos.map((a) => [a.id, a.estado]));
        for (const g of groupsWithEstado) {
          g.estadoAsunto = estadoByAsunto.get(g.asuntoJuridicoId) ?? "";
        }
      }
    }

    // 2) Batch-load labels para los IDs únicos de la página
    const labels = await this.findEntityLabels(
      uniqueGroupKeys(groupsWithEstado),
    );

    // 3) Map a DTO
    const grupos = toReporteGrupoDtoArray(groupsWithEstado, labels);

    return { grupos, totalCount, subtotales };
  }

  async getAgrupadoAll(
    filters: ReporteAgrupadoFilters,
  ): Promise<ReporteGrupoDto[]> {
    const where = buildWhere(filters);
    const groupsRaw = await this.callGroupBy({
      where,
      orderBy: [{ ano: "desc" }, { semana: "desc" }],
      needsSum: true,
    });

    const asuntoIds = [...new Set(groupsRaw.map((g) => g.asuntoJuridicoId))];
    const estadoByAsunto = new Map<string, string>();
    if (asuntoIds.length > 0) {
      const asuntos = await this.prisma.asuntoJuridico.findMany({
        where: { id: { in: asuntoIds } },
        select: { id: true, estado: true },
      });
      for (const a of asuntos) estadoByAsunto.set(a.id, a.estado);
    }

    const groups: ReporteAgrupadoGroupRow[] = groupsRaw.map((g) => ({
      usuarioId: g.usuarioId,
      clienteProveedorId: g.clienteProveedorId,
      asuntoJuridicoId: g.asuntoJuridicoId,
      equipoJuridicoId: g.equipoJuridicoId,
      socioId: g.socioId,
      estadoAsunto: estadoByAsunto.get(g.asuntoJuridicoId) ?? "",
      ano: g.ano,
      semana: g.semana,
      horas: g._sum.horas ? Number(g._sum.horas) : 0,
      importe: g._sum.importe ? Number(g._sum.importe) : 0,
    }));

    const labels = await this.findEntityLabels(uniqueGroupKeys(groups));
    return toReporteGrupoDtoArray(groups, labels);
  }

  async getSubtotales(filters: ReporteAgrupadoFilters): Promise<SubtotalesDto> {
    const where = buildWhere(filters);

    // Tres groupBy paralelos sobre el mismo `where`.
    // REQ-RHA-101: _sum ahora también incluye importe por dimensión.
    const [porAbogadoRaw, porClienteRaw, porAsuntoRaw] = await Promise.all([
      this.prisma.registroHora.groupBy({
        by: ["usuarioId"],
        where,
        _sum: { horas: true, importe: true },
        _count: { _all: true },
      }),
      this.prisma.registroHora.groupBy({
        by: ["clienteProveedorId"],
        where,
        _sum: { horas: true, importe: true },
        _count: { _all: true },
      }),
      this.prisma.registroHora.groupBy({
        by: ["asuntoJuridicoId"],
        where,
        _sum: { horas: true, importe: true },
        _count: { _all: true },
      }),
    ]);

    // Batch-load labels para los IDs únicos de cada dimensión.
    const usuarioIds = porAbogadoRaw.map((r) => r.usuarioId);
    const clienteIds = porClienteRaw.map((r) => r.clienteProveedorId);
    const asuntoIds = porAsuntoRaw.map((r) => r.asuntoJuridicoId);

    const [usuarios, clientes, asuntos] = await Promise.all([
      usuarioIds.length === 0
        ? Promise.resolve([])
        : this.prisma.user.findMany({
            where: { id: { in: usuarioIds } },
            select: { id: true, name: true },
          }),
      clienteIds.length === 0
        ? Promise.resolve([])
        : this.prisma.clienteProveedor.findMany({
            where: { id: { in: clienteIds } },
            select: { id: true, nombre: true },
          }),
      asuntoIds.length === 0
        ? Promise.resolve([])
        : this.prisma.asuntoJuridico.findMany({
            where: { id: { in: asuntoIds } },
            select: { id: true, nombre: true },
          }),
    ]);

    const usuarioMap = new Map(usuarios.map((u) => [u.id, u.name]));
    const clienteMap = new Map(clientes.map((c) => [c.id, c.nombre]));
    const asuntoMap = new Map(asuntos.map((a) => [a.id, a.nombre]));

    const porAbogado = porAbogadoRaw.map((r) => ({
      id: r.usuarioId,
      nombre: usuarioMap.get(r.usuarioId) ?? "—",
      horas: r._sum.horas ? Number(r._sum.horas) : 0,
      importe: r._sum.importe ? Number(r._sum.importe) : 0,
      grupos: r._count._all,
    }));

    const porCliente = porClienteRaw.map((r) => ({
      id: r.clienteProveedorId,
      nombre: clienteMap.get(r.clienteProveedorId) ?? "—",
      horas: r._sum.horas ? Number(r._sum.horas) : 0,
      importe: r._sum.importe ? Number(r._sum.importe) : 0,
      grupos: r._count._all,
    }));

    const porAsunto = porAsuntoRaw.map((r) => ({
      id: r.asuntoJuridicoId,
      nombre: asuntoMap.get(r.asuntoJuridicoId) ?? "—",
      horas: r._sum.horas ? Number(r._sum.horas) : 0,
      importe: r._sum.importe ? Number(r._sum.importe) : 0,
      grupos: r._count._all,
    }));

    // Totales: suma de horas + suma de importe + suma de grupos a través de las dimensiones.
    const totalHoras =
      porAbogado.reduce((acc, x) => acc + x.horas, 0) ||
      porCliente.reduce((acc, x) => acc + x.horas, 0) ||
      porAsunto.reduce((acc, x) => acc + x.horas, 0);

    const totalImporte =
      porAbogado.reduce((acc, x) => acc + x.importe, 0) ||
      porCliente.reduce((acc, x) => acc + x.importe, 0) ||
      porAsunto.reduce((acc, x) => acc + x.importe, 0);

    // Para el total de grupos debemos contar el número de grupos (combinaciones) que
    // existen en el set filtrado. Lo calculamos con un groupBy mínimo.
    const totalGruposRaw = await this.prisma.registroHora
      .groupBy({
        by: [
          "usuarioId",
          "clienteProveedorId",
          "asuntoJuridicoId",
          "equipoJuridicoId",
          "socioId",
          "ano",
          "semana",
        ],
        where,
        _count: { _all: true },
      })
      .then((rows) => rows.length);

    return {
      totalHoras: roundHoras(totalHoras),
      totalImporte: roundHoras(totalImporte),
      totalGrupos: totalGruposRaw,
      porAbogado: porAbogado.map((x) => ({
        id: x.id,
        nombre: x.nombre,
        horas: roundHoras(x.horas),
        importe: roundHoras(x.importe),
        grupos: x.grupos,
      })),
      porCliente: porCliente.map((x) => ({
        id: x.id,
        nombre: x.nombre,
        horas: roundHoras(x.horas),
        importe: roundHoras(x.importe),
        grupos: x.grupos,
      })),
      porAsunto: porAsunto.map((x) => ({
        id: x.id,
        nombre: x.nombre,
        horas: roundHoras(x.horas),
        importe: roundHoras(x.importe),
        grupos: x.grupos,
      })),
    };
  }

  async findEntityLabels(input: {
    usuarioIds: string[];
    clienteProveedorIds: string[];
    asuntoJuridicoIds: string[];
    equipoJuridicoIds: string[];
    socioIds: string[];
  }): Promise<EntityLabels> {
    const [usuarios, clientes, asuntos, equipos, socios] = await Promise.all([
      input.usuarioIds.length === 0
        ? Promise.resolve([])
        : this.prisma.user.findMany({
            where: { id: { in: input.usuarioIds } },
            select: { id: true, name: true },
          }),
      input.clienteProveedorIds.length === 0
        ? Promise.resolve([])
        : this.prisma.clienteProveedor.findMany({
            where: { id: { in: input.clienteProveedorIds } },
            select: { id: true, nombre: true },
          }),
      input.asuntoJuridicoIds.length === 0
        ? Promise.resolve([])
        : this.prisma.asuntoJuridico.findMany({
            where: { id: { in: input.asuntoJuridicoIds } },
            select: { id: true, nombre: true },
          }),
      input.equipoJuridicoIds.length === 0
        ? Promise.resolve([])
        : this.prisma.equipoJuridico.findMany({
            where: { id: { in: input.equipoJuridicoIds } },
            select: { id: true, nombre: true },
          }),
      input.socioIds.length === 0
        ? Promise.resolve([])
        : this.prisma.socio.findMany({
            where: { id: { in: input.socioIds } },
            select: { id: true, nombre: true },
          }),
    ]);

    return {
      usuarios: new Map(usuarios.map((u) => [u.id, u.name])),
      clientes: new Map(clientes.map((c) => [c.id, c.nombre])),
      asuntos: new Map(asuntos.map((a) => [a.id, a.nombre])),
      equipos: new Map(equipos.map((e) => [e.id, e.nombre])),
      socios: new Map(socios.map((s) => [s.id, s.nombre])),
    };
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function roundHoras(value: number): number {
  return Math.round(value * 100) / 100;
}

// Re-exports to satisfy old import paths if any / for tests
export { toReporteGrupoDto };
