"use client";

import { Briefcase, Calendar, DollarSign, User, UserCircle, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import { Badge } from "@/core/shared/ui/badge";
import { NIVEL_LABELS, MODALIDAD_LABELS } from "../helpers/colaboradorLabels";
import { formatAntiguedad } from "../helpers/formatAntiguedad";
import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";

interface ResumenTabProps {
  colaborador: ColaboradorDto;
  reportesDirectos: number;
  /**
   * VacationBalance snapshot for the colaborador. `null` means "no row
   * registered yet" — spec cap3 req4 says we MUST render "Sin registrar"
   * (NEVER 0/0) in that case. We accept the POJO shape on purpose so the
   * component never reads from Prisma directly.
   */
  vacaciones: {
    diasDisponibles: number;
    diasTomados: number;
  } | null;
}

/**
 * Resumen tab (spec cap3 + cap2 req3 + cap2 req8).
 *
 * Four KPI cards stacked above two context cards (Bio + Reporta-a):
 *   1. Antigüedad        → years+months from `fechaIngreso`.
 *   2. Sueldo actual     → `Intl.NumberFormat('es-MX')` over the live `sueldo`.
 *   3. Vacaciones        → "X/Y" from the prefetched VacationBalance, or
 *                          "Sin registrar" when no balance has been set.
 *   4. Reportes directos → server-computed count (always integer ≥ 0).
 *
 * Source-of-truth reminders:
 * - The Antigüedad math is hand-rolled against `date-fns`
 *   (differenceInYears + differenceInMonths). `date-fns` is already a
 *   dependency of the project — no new install required.
 * - Vacaciones "Sin registrar" is a literal cap, not a stylistic choice.
 * - Reportes directos is server-derived — the KPI never recomputes on the
 *   client.
 */
export function ResumenTab({
  colaborador,
  reportesDirectos,
  vacaciones,
}: ResumenTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── KPI grid ────────────────────────────────────────────────── */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={Calendar}
          label="Antigüedad"
          value={formatAntiguedad(colaborador.fechaIngreso)}
          muted={colaborador.fechaIngreso === null}
        />

        <KpiCard
          icon={DollarSign}
          label="Sueldo actual"
          value={formatSueldo(colaborador.sueldo)}
          muted={!hasSueldo(colaborador.sueldo)}
        />

        <KpiCard
          icon={Briefcase}
          label="Vacaciones"
          value={formatVacaciones(vacaciones)}
          muted={vacaciones === null}
          subtitle={
            vacaciones
              ? `${vacaciones.diasTomados} tomados · ${vacaciones.diasDisponibles} disponibles`
              : "Sin balance registrado"
          }
        />

        <KpiCard
          icon={Users}
          label="Reportes directos"
          value={String(reportesDirectos)}
          muted={false}
          subtitle={
            reportesDirectos === 1
              ? "1 colaborador reporta al mismo socio"
              : `${reportesDirectos} colaboradores reportan al mismo socio`
          }
        />
      </div>

      {/* ── Bio + Reporta-a ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCircle className="h-4 w-4" />
            Bio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {colaborador.bio && colaborador.bio.trim().length > 0 ? (
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {colaborador.bio}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sin bio</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Reporta a
          </CardTitle>
        </CardHeader>
        <CardContent>
          {colaborador.socio ? (
            <div className="space-y-1">
              <div className="text-base font-medium">
                {colaborador.socio.nombre}
              </div>
              {colaborador.socio.email && (
                <a
                  href={`mailto:${colaborador.socio.email}`}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  {colaborador.socio.email}
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Sin socio asignado
            </p>
          )}

          {/* Nivel + Modalidad are quick identifiers; we surface them here
              only when present, never fabricated. */}
          {(colaborador.nivel || colaborador.modalidad) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {colaborador.nivel && (
                <Badge variant="secondary">
                  {NIVEL_LABELS[colaborador.nivel] ?? colaborador.nivel}
                </Badge>
              )}
              {colaborador.modalidad && (
                <Badge variant="outline">
                  {MODALIDAD_LABELS[colaborador.modalidad] ??
                    colaborador.modalidad}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── KPI card ───────────────────────────────────────────────────────────── */

function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
  muted,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtitle?: string;
  muted: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={
            muted
              ? "text-2xl font-semibold text-muted-foreground italic"
              : "text-2xl font-semibold"
          }
        >
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Format helpers (all client-side presentation only) ──────────────────── */

/**
 * Format the live `sueldo` field as MXN. Prisma stores it as Decimal and the
 * mapper serializes it to a string. We accept "0" as a legitimate value
 * (registered but zero), but empty / null / non-numeric ⇒ "Sin registrar".
 */
function formatSueldo(sueldo: string | null | undefined): string {
  if (sueldo === null || sueldo === undefined || sueldo === "") {
    return "Sin registrar";
  }
  const n = typeof sueldo === "string" ? Number(sueldo) : sueldo;
  if (!Number.isFinite(n)) {
    return "Sin registrar";
  }
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(n);
  } catch {
    return "Sin registrar";
  }
}

function hasSueldo(sueldo: string | null | undefined): boolean {
  if (sueldo === null || sueldo === undefined || sueldo === "") return false;
  const n = Number(sueldo);
  return Number.isFinite(n);
}

/**
 * Spec cap3 req4: "X/Y" when a VacationBalance exists, "Sin registrar" when
 * not. NEVER "0/0" — that's the entire reason for the spec wording.
 */
function formatVacaciones(
  balance: { diasDisponibles: number; diasTomados: number } | null
): string {
  if (!balance) return "Sin registrar";
  return `${balance.diasTomados}/${balance.diasDisponibles}`;
}
