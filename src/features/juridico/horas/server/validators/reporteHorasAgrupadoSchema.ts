import { z } from "zod";
import type {
  ReporteAgrupadoFilters,
  ReporteAgrupadoSortField,
} from "../dtos/ReporteHorasAgrupadoDto.dto";

/**
 * Schema para `getReporteHorasAgrupadoAction`.
 * Paginated server-side. Filtros todos opcionales; `page >= 1`,
 * `1 <= pageSize <= 100`. Refine: `semanaDesde <= semanaHasta`.
 */

const estadoSchema = z.enum(["ACTIVO", "INACTIVO", "CERRADO"]);

const filtersSchema = z
  .object({
    usuarioId: z.string().min(1).optional(),
    asuntoJuridicoId: z.string().min(1).optional(),
    clienteProveedorId: z.string().min(1).optional(),
    equipoJuridicoId: z.string().min(1).optional(),
    socioId: z.string().min(1).optional(),
    horasDesde: z.number().nonnegative().optional(),
    horasHasta: z.number().nonnegative().optional(),
    estado: estadoSchema.optional(),
    ano: z.number().int().min(1900).max(2999).optional(),
    semanaDesde: z.number().int().min(1).max(53).optional(),
    semanaHasta: z.number().int().min(1).max(53).optional(),
  })
  .refine(
    (f) =>
      f.horasDesde === undefined ||
      f.horasHasta === undefined ||
      f.horasDesde <= f.horasHasta,
    {
      message: "horasDesde no puede ser mayor que horasHasta",
      path: ["horasDesde"],
    },
  )
  .refine(
    (f) =>
      f.semanaDesde === undefined ||
      f.semanaHasta === undefined ||
      f.semanaDesde <= f.semanaHasta,
    {
      message: "semanaDesde no puede ser mayor que semanaHasta",
      path: ["semanaDesde"],
    },
  );

const sortSchema = z
  .object({
    field: z.enum(["ano", "semana", "horas"]),
    direction: z.enum(["asc", "desc"]),
  })
  .optional();

export const reporteHorasAgrupadoSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sort: sortSchema,
  filters: filtersSchema.default({}),
});

export type ReporteHorasAgrupadoSchemaInput = z.input<
  typeof reporteHorasAgrupadoSchema
>;
export type ReporteHorasAgrupadoSchemaOutput = z.output<
  typeof reporteHorasAgrupadoSchema
>;

// ─── Helpers de tipado (server-side) ──────────────────────────────────────────
export type ParsedReporteAgrupadoFilters = ReporteAgrupadoFilters;
export type ParsedReporteAgrupadoSortField = ReporteAgrupadoSortField;
