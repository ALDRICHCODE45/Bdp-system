import type {
  ReporteAgrupadoFilters,
  ReporteAgrupadoPageDto,
  ReporteGrupoDto,
  ReporteAgrupadoSort,
  SubtotalesDto,
} from "../dtos/ReporteHorasAgrupadoDto.dto";

/**
 * Entity para los labels batch-loaded que alimentan al mapper.
 * Una sola entidad + un array de IDs producen un `Map<id, label>`.
 */
export type EntityLabels = {
  usuarios: Map<string, string>;
  clientes: Map<string, string>;
  asuntos: Map<string, string>;
  equipos: Map<string, string>;
  socios: Map<string, string>;
};

/** Group keys (Prisma `groupBy` por dimensión — sin labels). */
export type ReporteAgrupadoGroupRow = {
  usuarioId: string;
  clienteProveedorId: string;
  asuntoJuridicoId: string;
  equipoJuridicoId: string;
  socioId: string;
  estadoAsunto: string;
  ano: number;
  semana: number;
  horas: number;
  /** REQ-RHA-100: suma de importe (MXN) por grupo. */
  importe: number;
};

export type ReporteAgrupadoPageArgs = {
  filters: ReporteAgrupadoFilters;
  page: number;
  pageSize: number;
  sort?: ReporteAgrupadoSort;
};

export interface ReporteHorasAgrupadoRepository {
  /**
   * Devuelve una página de grupos + el total de grupos que cumplen los filtros
   * + subtotales por dimensión.
   */
  getAgrupado(args: ReporteAgrupadoPageArgs): Promise<ReporteAgrupadoPageDto>;

  /**
   * Devuelve TODOS los grupos que cumplen los filtros (sin paginación).
   * Usado exclusivamente por la exportación Excel.
   */
  getAgrupadoAll(filters: ReporteAgrupadoFilters): Promise<ReporteGrupoDto[]>;

  /**
   * Devuelve los subtotales (por abogado, cliente y asunto) para un set filtrado.
   * Usado dentro de `getAgrupado`, pero también expuesto por si la UI quiere
   * previsualizar subtotales sin cargar la tabla.
   */
  getSubtotales(filters: ReporteAgrupadoFilters): Promise<SubtotalesDto>;

  /**
   * Carga etiquetas (nombre) de las cinco entidades referenciadas por los grupos.
   * Recibe los IDs únicos y devuelve cinco `Map`s id → nombre.
   */
  findEntityLabels(input: {
    usuarioIds: string[];
    clienteProveedorIds: string[];
    asuntoJuridicoIds: string[];
    equipoJuridicoIds: string[];
    socioIds: string[];
  }): Promise<EntityLabels>;
}
