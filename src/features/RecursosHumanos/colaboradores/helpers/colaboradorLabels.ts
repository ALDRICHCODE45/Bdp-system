/**
 * Shared label maps for Colaborador domain enums.
 *
 * Centralized here to avoid drift across table columns, card view, Excel export
 * and status badge consumers. All keys are the raw Prisma enum strings; values
 * are the Spanish labels rendered in the UI.
 *
 * NOTE: Style maps (NIVEL_STYLES, STATUS_STYLES) intentionally stay with their
 * consumers because they are component-coupled (Tailwind classes, dark mode, etc.).
 */

/**
 * Nivel seniority labels (used in Cargo cell badge and card view).
 */
export const NIVEL_LABELS: Record<string, string> = {
  JUNIOR: "Junior",
  SEMI_SENIOR: "Semi-Senior",
  SENIOR: "Senior",
  LEAD: "Lead",
  GERENCIAL: "Gerencial",
};

/**
 * Modalidad de trabajo labels (used in Modalidad cell badge and card view).
 */
export const MODALIDAD_LABELS: Record<string, string> = {
  REMOTO: "Remoto",
  HIBRIDO: "Híbrido",
  PRESENCIAL: "Presencial",
};

/**
 * Tipo de contrato labels (used in LaboralTab and the identity rail).
 */
export const TIPO_CONTRATO_LABELS: Record<string, string> = {
  INDEFINIDO: "Indefinido",
  TEMPORAL: "Temporal",
  POR_OBRA: "Por obra",
  PRACTICAS: "Prácticas",
  HONORARIOS: "Honorarios",
};

/**
 * Estado del colaborador labels (used in Estado badge, card view and export).
 */
export const STATUS_LABELS: Record<string, string> = {
  CONTRATADO: "Contratado",
  EN_LICENCIA: "En licencia",
  DESPEDIDO: "Despedido",
};
