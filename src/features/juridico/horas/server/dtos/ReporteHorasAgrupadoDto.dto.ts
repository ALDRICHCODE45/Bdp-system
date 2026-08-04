// ─── Reporte de Horas Agrupado (Jurídico) ─────────────────────────────────────
// DTOs que cruzan la frontera server → client. Cada tipo refleja exactamente la
// forma que devuelve `PrismaReporteHorasAgrupadoRepository` + el mapper.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Filtros combinables (AND). Todos opcionales; ausente = sin restricción.
 * El legacy `mes` ya no forma parte de este reporte (la spec lo prohíbe).
 */
export type ReporteAgrupadoEstado = "ACTIVO" | "INACTIVO" | "CERRADO";

export type ReporteAgrupadoFilters = {
  /** Abogado: `RegistroHora.usuarioId` (modelo `User`, NO `Colaborador`). */
  usuarioId?: string;
  asuntoJuridicoId?: string;
  clienteJuridicoId?: string;
  equipoJuridicoId?: string;
  socioId?: string;
  /** Rango de horas (Decimal inclusivo). */
  horasDesde?: number;
  horasHasta?: number;
  /** Estado del asunto asociado. */
  estado?: ReporteAgrupadoEstado;
  /** Año ISO. */
  ano?: number;
  /** Semana ISO inclusiva. */
  semanaDesde?: number;
  semanaHasta?: number;
};

/**
 * Una fila = un grupo (abogado × cliente × asunto × año × semana)
 * con la suma de horas de todos los registros que caen en ese grupo.
 */
export type ReporteGrupoDto = {
  usuarioId: string;
  usuarioNombre: string;
  clienteJuridicoId: string;
  clienteNombre: string;
  asuntoJuridicoId: string;
  asuntoNombre: string;
  equipoJuridicoId: string;
  equipoNombre: string;
  socioId: string;
  socioNombre: string;
  estadoAsunto: ReporteAgrupadoEstado | string;
  ano: number;
  semana: number;
  horas: number;
};

/** Subtotal por dimensión (abogado / cliente / asunto). */
export type ReporteAgrupadoSubtotalItemDto = {
  id: string;
  nombre: string;
  horas: number;
  grupos: number;
};

export type SubtotalesDto = {
  totalHoras: number;
  totalGrupos: number;
  porAbogado: ReporteAgrupadoSubtotalItemDto[];
  porCliente: ReporteAgrupadoSubtotalItemDto[];
  porAsunto: ReporteAgrupadoSubtotalItemDto[];
};

export type ReporteAgrupadoPageDto = {
  grupos: ReporteGrupoDto[];
  /** Cantidad total de grupos que cumplen los filtros (para paginación). */
  totalCount: number;
  subtotales: SubtotalesDto;
};

/** Sort options para server-side sorting. */
export type ReporteAgrupadoSortField = "ano" | "semana" | "horas";
export type ReporteAgrupadoSort = {
  field: ReporteAgrupadoSortField;
  direction: "asc" | "desc";
};

/** Param shape que reciben las server actions (filtros + paginación + sort). */
export type ReporteAgrupadoQueryParams = ReporteAgrupadoFilters & {
  page: number;
  pageSize: number;
  sort?: ReporteAgrupadoSort;
};
