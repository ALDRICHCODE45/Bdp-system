/**
 * Estado de los filtros avanzados del sheet.
 * Todos los campos de texto/select son arrays (multi-select o multi-tag).
 * Los rangos numéricos y de fecha se guardan como strings para el formulario.
 */
export interface FacturasAdvancedFilters {
  // ── Identificación ────────────────────────────────────────────
  uuid: string[];       // tag input — OR entre valores
  usoCfdi: string[];    // multi-select

  // ── Emisor ───────────────────────────────────────────────────
  rfcEmisor: string[];    // tag input
  nombreEmisor: string[]; // tag input

  // ── Receptor ─────────────────────────────────────────────────
  rfcReceptor: string[];    // tag input
  nombreReceptor: string[]; // tag input

  // ── Montos (rangos numéricos como string para inputs) ─────────
  subtotalMin: string;
  subtotalMax: string;
  totalMin: string;
  totalMax: string;
  impTrasladosMin: string;
  impTrasladosMax: string;
  impRetenidosMin: string;
  impRetenidosMax: string;

  // ── Pago ─────────────────────────────────────────────────────
  fechaPagoFrom: string; // yyyy-MM-dd
  fechaPagoTo: string;   // yyyy-MM-dd

  // ── Auditoría ────────────────────────────────────────────────
  ingresadoPor: string[]; // multi-select de user IDs
  createdAtFrom: string;
  createdAtTo: string;
  updatedAtFrom: string;
  updatedAtTo: string;
}

export const EMPTY_ADVANCED_FILTERS: FacturasAdvancedFilters = {
  uuid: [],
  usoCfdi: [],
  rfcEmisor: [],
  nombreEmisor: [],
  rfcReceptor: [],
  nombreReceptor: [],
  subtotalMin: "",
  subtotalMax: "",
  totalMin: "",
  totalMax: "",
  impTrasladosMin: "",
  impTrasladosMax: "",
  impRetenidosMin: "",
  impRetenidosMax: "",
  fechaPagoFrom: "",
  fechaPagoTo: "",
  ingresadoPor: [],
  createdAtFrom: "",
  createdAtTo: "",
  updatedAtFrom: "",
  updatedAtTo: "",
};

/** Cuenta cuántos grupos de filtros avanzados tienen algún valor activo. */
export function countActiveAdvancedFilters(f: FacturasAdvancedFilters): number {
  let count = 0;
  if (f.uuid.length || f.usoCfdi.length) count++;
  if (f.rfcEmisor.length || f.nombreEmisor.length) count++;
  if (f.rfcReceptor.length || f.nombreReceptor.length) count++;
  if (f.subtotalMin || f.subtotalMax || f.totalMin || f.totalMax ||
      f.impTrasladosMin || f.impTrasladosMax || f.impRetenidosMin || f.impRetenidosMax) count++;
  if (f.fechaPagoFrom || f.fechaPagoTo) count++;
  if (f.ingresadoPor.length || f.createdAtFrom || f.createdAtTo ||
      f.updatedAtFrom || f.updatedAtTo) count++;
  return count;
}
