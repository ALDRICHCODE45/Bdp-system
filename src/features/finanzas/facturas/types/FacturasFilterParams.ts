export interface FacturasFilterParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;

  // ── Tab (multi-select: OR entre los valores) ─────────────────
  status?: string[];

  // ── Quick filters (multi-select) ─────────────────────────────
  metodoPago?: string[];
  moneda?: string[];
  statusPago?: string[];

  // ── Advanced: Identificación ─────────────────────────────────
  uuid?: string[];     // OR-contains en cada valor
  usoCfdi?: string[];  // IN exacto

  // ── Advanced: Emisor ─────────────────────────────────────────
  rfcEmisor?: string[];    // OR-contains
  nombreEmisor?: string[]; // OR-contains

  // ── Advanced: Receptor ───────────────────────────────────────
  rfcReceptor?: string[];    // OR-contains
  nombreReceptor?: string[]; // OR-contains

  // ── Advanced: Montos ─────────────────────────────────────────
  subtotalMin?: number;
  subtotalMax?: number;
  totalMin?: number;
  totalMax?: number;
  impTrasladosMin?: number;
  impTrasladosMax?: number;
  impRetenidosMin?: number;
  impRetenidosMax?: number;

  // ── Advanced: Pago ───────────────────────────────────────────
  fechaPagoFrom?: string; // yyyy-MM-dd
  fechaPagoTo?: string;

  // ── Advanced: Auditoría ──────────────────────────────────────
  ingresadoPor?: string[]; // user IDs
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
}
