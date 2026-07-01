/**
 * DTO (server→client boundary) for the Organigrama tab (cap7).
 *
 * Shapes:
 * - `OrgTreeNode` — a single tree group: a socio root + its colaborador
 *   leaves, OR the synthetic "Sin socio asignado" bucket.
 * - `OrgTreeDto` — the full tree for one colaborador: the current
 *   colaborador's own socio bucket + a separate "Sin socio" bucket if
 *   they're a leaf in it.
 *
 * `currentColaboradorId` lets the OrgTree component know which row to
 * highlight without re-fetching the profile (cap7 req2).
 */

export type OrgTreeColaboradorLeaf = {
  id: string;
  name: string;
  correo: string;
  puesto: string;
  status: "CONTRATADO" | "DESPEDIDO" | "EN_LICENCIA";
};

export type OrgTreeNode = {
  /** Stable id for the React key. `null` for the "Sin socio asignado" bucket. */
  socioId: string | null;
  /** Display label for the root. "Sin socio asignado" when socioId is null. */
  label: string;
  /** Sub-label for the root (email when available). Empty string otherwise. */
  subLabel: string;
  /** Count of colaboradores in this bucket. Always >= 1. */
  count: number;
  /** Colaboradores grouped under this root. */
  colaboradores: OrgTreeColaboradorLeaf[];
  /**
   * `true` when this node corresponds to the current colaborador's OWN
   * socio (or the "Sin socio asignado" bucket if the current has none).
   * The OrgTree uses this to flag the row visually.
   */
  isCurrentBucket: boolean;
};

export type OrgTreeDto = {
  currentColaboradorId: string;
  nodes: OrgTreeNode[];
};