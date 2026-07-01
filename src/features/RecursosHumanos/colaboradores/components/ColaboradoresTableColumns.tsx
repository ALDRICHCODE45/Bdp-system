"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/shared/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/shared/ui/tooltip";
import { cn } from "@/core/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { ColaboradorStatusBadge } from "./ColaboradorStatusBadge";
import { NIVEL_LABELS, MODALIDAD_LABELS } from "../helpers/colaboradorLabels";

/**
 * Celda vacía estándar para valores nulos.
 */
const EmptyCell = () => (
  <span className="text-xs text-muted-foreground">—</span>
);

/**
 * Nivel seniority badge styles. Kept here (not in shared labels) because they
 * are Tailwind-class coupled to this column cell.
 */
const NIVEL_STYLES: Record<string, string> = {
  JUNIOR:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0",
  SEMI_SENIOR:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0",
  SENIOR:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-0",
  LEAD:
    "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 border-0",
  GERENCIAL:
    "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300 border-0",
};

/**
 * Format fechaIngreso ISO string to "d MMM yyyy" (es-MX).
 */
const formatDate = (isoString: string | null | undefined) => {
  if (!isoString) return null;
  try {
    return format(parseISO(isoString), "d MMM yyyy", { locale: es });
  } catch {
    return null;
  }
};

/**
 * P1 — Slim 7-col table for colaboradores (cap1 req1).
 *
 * Order: Colaborador · Cargo(+nivel) · Departamento · Jefe · FechaIngreso · Modalidad · Estado
 * Exactly 7 columns. No checkbox / actions (CC10: legacy reachable until P7).
 */
export const colaboradoresColumns: ColumnDef<ColaboradorDto>[] = [
  // ── 1. Colaborador ──────────────────────────────────────────────────────
  {
    id: "colaborador",
    accessorKey: "name",
    header: "Colaborador",
    cell: ({ row }) => {
      const name = row.original.name;
      const correo = row.original.correo;
      return (
        <div className="flex flex-col min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium truncate max-w-[220px] block">
                {name}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{name}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground truncate max-w-[220px] block">
                {correo}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{correo}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    size: 24,
  },

  // ── 2. Cargo (puesto) + nivel badge ───────────────────────────────────
  {
    id: "cargo",
    accessorKey: "puesto",
    header: "Cargo",
    cell: ({ row }) => {
      const puesto = row.original.puesto;
      const nivel = row.original.nivel;
      return (
        <div className="flex flex-col gap-1 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm truncate max-w-[160px] block">
                {puesto || <EmptyCell />}
              </span>
            </TooltipTrigger>
            {puesto && (
              <TooltipContent>
                <p className="text-xs">{puesto}</p>
              </TooltipContent>
            )}
          </Tooltip>
          {nivel && (
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] rounded-xs w-fit",
                NIVEL_STYLES[nivel],
              )}
            >
              {NIVEL_LABELS[nivel] ?? nivel}
            </Badge>
          )}
        </div>
      );
    },
    size: 18,
  },

  // ── 3. Departamento ───────────────────────────────────────────────────
  {
    id: "departamento",
    accessorKey: "departamento",
    header: "Departamento",
    cell: ({ row }) => {
      const departamento = row.original.departamento;
      if (!departamento) return <EmptyCell />;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs truncate max-w-[140px] block">
              {departamento}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{departamento}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 14,
  },

  // ── 4. Jefe (= socio.nombre || "Sin socio asignado") ─────────────────
  {
    id: "jefe",
    accessorKey: "socio",
    header: "Jefe",
    cell: ({ row }) => {
      const socio = row.original.socio;
      if (!socio) {
        // Cap1 req1 + scenario: null socioId → "Sin socio asignado"
        return (
          <span className="text-xs text-muted-foreground italic">
            Sin socio asignado
          </span>
        );
      }
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs truncate max-w-[160px] block">
              {socio.nombre}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{socio.nombre}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 16,
  },

  // ── 5. FechaIngreso ───────────────────────────────────────────────────
  {
    id: "fechaIngreso",
    accessorKey: "fechaIngreso",
    header: "Fecha Ingreso",
    cell: ({ row }) => {
      const formatted = formatDate(row.original.fechaIngreso);
      if (!formatted) return <EmptyCell />;
      return <span className="text-xs whitespace-nowrap">{formatted}</span>;
    },
    size: 12,
  },

  // ── 6. Modalidad ──────────────────────────────────────────────────────
  {
    id: "modalidad",
    accessorKey: "modalidad",
    header: "Modalidad",
    cell: ({ row }) => {
      const modalidad = row.original.modalidad;
      if (!modalidad) return <EmptyCell />;
      return (
        <Badge variant="outline" className="text-xs rounded-xs">
          {MODALIDAD_LABELS[modalidad] ?? modalidad}
        </Badge>
      );
    },
    size: 10,
  },

  // ── 7. Estado (status badge — ≤3 color tokens per cap1 req7) ──────────
  {
    id: "estado",
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <ColaboradorStatusBadge status={row.original.status} />,
    size: 10,
  },
];