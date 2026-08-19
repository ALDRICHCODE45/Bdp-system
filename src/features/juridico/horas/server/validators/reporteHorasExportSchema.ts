import { z } from "zod";

/**
 * Schema para `getHorasAgrupadasExportAction`.
 * Sin paginación — trae todos los grupos que cumplen los filtros.
 * Mantiene la misma refine semántica que el schema paginado.
 */

const estadoSchema = z.enum(["ACTIVO", "INACTIVO", "CERRADO"]);

const exportFiltersSchema = z
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

export const reporteHorasExportSchema = z.object({
  filters: exportFiltersSchema.default({}),
});

export type ReporteHorasExportSchemaInput = z.input<
  typeof reporteHorasExportSchema
>;
export type ReporteHorasExportSchemaOutput = z.output<
  typeof reporteHorasExportSchema
>;
