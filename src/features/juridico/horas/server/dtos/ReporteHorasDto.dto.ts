export type ReporteHorasFilters = {
  equipoJuridicoId?: string;
  clienteJuridicoId?: string;
  asuntoJuridicoId?: string;
  socioId?: string;
  usuarioId?: string;
  ano?: number;
  mes?: number; // 1-12, maps to ISO weeks in that month
  semanaDesde?: number;
  semanaHasta?: number;
};

export type ReporteHorasRowDto = {
  id: string;
  usuarioNombre: string;
  usuarioEmail: string;
  equipoNombre: string;
  clienteNombre: string;
  asuntoNombre: string;
  socioNombre: string;
  horas: number;
  descripcion: string | null;
  ano: number;
  semana: number;
  createdAt: string;
};

export type ReporteHorasResumenDto = {
  totalHoras: number;
  totalRegistros: number;
  rows: ReporteHorasRowDto[];
};
