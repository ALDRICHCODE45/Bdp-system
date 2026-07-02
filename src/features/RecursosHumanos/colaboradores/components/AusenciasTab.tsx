"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Briefcase,
  CalendarOff,
  HeartPulse,
  Pencil,
  Plane,
  Plus,
  Umbrella,
} from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/core/shared/ui/chart";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { DatePicker } from "@/core/shared/ui/date-picker";
import { formatDateToYmd, parseYmdToDate } from "../helpers/dateField";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/core/shared/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import { Badge } from "@/core/shared/ui/badge";
import { Separator } from "@/core/shared/ui/separator";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/core/shared/ui/empty";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

import {
  useAbsenceRecords,
  useCreateAbsence,
} from "../hooks/useAbsenceRecords.hook";
import {
  useSetVacationBalance,
  useVacationBalance,
} from "../hooks/useVacationBalance.hook";
import type { AbsenceRecordDto } from "../server/dtos/AbsenceRecordDto.dto";
import type { VacationBalanceDto } from "../server/dtos/VacationBalanceDto.dto";

interface AusenciasTabProps {
  colaboradorId: string;
  /**
   * RSC-prefetched VacationBalance snapshot (P2 + P4 prefetch). When the
   * user opens the Ausencias tab the donut renders this data immediately;
   * the TanStack Query refreshes in the background afterwards.
   * `null` means "no balance has ever been registered" — cap9 req5 says
   * the donut MUST render its empty state, NOT a fabricated 0/0.
   */
  vacaciones: VacationBalanceDto | null;
}

const AUSENCIA_LABELS: Record<
  AbsenceRecordDto["tipo"],
  { label: string; icon: typeof Plane }
> = {
  VACACIONES: { label: "Vacaciones", icon: Umbrella },
  LICENCIA: { label: "Licencias", icon: Plane },
  INCAPACIDAD: { label: "Incapacidades", icon: HeartPulse },
};

const AUSENCIA_ORDER: AbsenceRecordDto["tipo"][] = [
  "VACACIONES",
  "LICENCIA",
  "INCAPACIDAD",
];

/**
 * P6 — Ausencias tab (spec cap9 + cap13).
 *
 * Layout:
 *
 *   1. BalanceCard — VacationBalance donut chart of `diasDisponibles` vs
 *      `diasTomados`. Renders the EMPTY STATE when no balance has been
 *      registered yet (cap9 req5: never fabricate a 0/0). The "Registrar
 *      balance" form is gated by `colaboradores:gestionar-ausencias` (CC1/CC8).
 *
 *   2. AbsenceRegistry — registry grouped by `tipo` (Vacaciones / Licencias
 *      / Incapacidades). Each group shows its own empty state when no
 *      entries exist. Pure read — gated by `colaboradores:acceder` at the
 *      server.
 *
 *   3. CreateAbsenceCard — registration form. Wrapped in
 *      `<PermissionGuard permission="colaboradores:gestionar-ausencias">`
 *      so a viewer without that permission never sees the controls. The
 *      Server Action also gates itself, so even a tampered client call
 *      would be rejected (cap13 req5 — defense in depth).
 *
 * The tab is visible with `colaboradores:acceder` only (read-only degrade
 * per cap13 req4); the Create controls are hidden for those viewers.
 */
export function AusenciasTab({
  colaboradorId,
  vacaciones,
}: AusenciasTabProps) {
  return (
    <div className="space-y-6">
      <BalanceCard
        colaboradorId={colaboradorId}
        initialBalance={vacaciones}
      />

      <AbsenceRegistry colaboradorId={colaboradorId} />

      <PermissionGuard
        permissions={[
          PermissionActions.colaboradores["gestionar-ausencias"],
          PermissionActions.colaboradores.gestionar,
        ]}
        fallback={null}
      >
        <CreateAbsenceCard colaboradorId={colaboradorId} />
      </PermissionGuard>
    </div>
  );
}

/* ── Balance (donut + set form) ────────────────────────────────────────────── */

function BalanceCard({
  colaboradorId,
  initialBalance,
}: {
  colaboradorId: string;
  initialBalance: VacationBalanceDto | null;
}) {
  const { data, isLoading } = useVacationBalance(
    colaboradorId,
    initialBalance
  );
  const balance = data ?? null;
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Balance de vacaciones
          </CardTitle>
          <CardDescription>
            Días disponibles y días tomados. Se configura manualmente; no hay
            reglas de acumulación automática.
          </CardDescription>
        </div>
        <PermissionGuard
          permissions={[
            PermissionActions.colaboradores["gestionar-ausencias"],
            PermissionActions.colaboradores.gestionar,
          ]}
        >
          {balance && !editing ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
              className="gap-1"
            >
              <Pencil className="h-4 w-4" />
              Ajustar
            </Button>
          ) : null}
        </PermissionGuard>
      </CardHeader>
      <CardContent>
        {isLoading && !balance ? (
          <p className="text-sm text-muted-foreground">Cargando balance…</p>
        ) : !balance ? (
          <BalanceEmptyState />
        ) : editing ? (
          <SetBalanceForm
            colaboradorId={colaboradorId}
            initial={balance}
            onDone={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <BalanceDonut balance={balance} />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Cap9 req5: "Cuando no hay VacationBalance, mostrar empty state (sin
 * valores cero, sin totales fabricados)". We deliberately do NOT render a
 * 0/0 chart — the user explicitly hasn't set a balance, and the donut
 * shouldn't imply one exists.
 */
function BalanceEmptyState() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyTitle>Sin balance registrado</EmptyTitle>
        <EmptyDescription>
          Aún no se ha registrado un balance de vacaciones para este
          colaborador. Usa la sección &quot;Registrar ausencia&quot; abajo
          para registrar eventos individuales.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

const balanceChartConfig = {
  disponibles: {
    label: "Disponibles",
    color: "hsl(142, 71%, 45%)",
  },
  tomados: {
    label: "Tomados",
    color: "hsl(38, 92%, 50%)",
  },
} satisfies ChartConfig;

function BalanceDonut({ balance }: { balance: VacationBalanceDto }) {
  const chartData = [
    { name: "disponibles", value: balance.diasDisponibles },
    { name: "tomados", value: balance.diasTomados },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <ChartContainer
        config={balanceChartConfig}
        className="mx-auto h-[220px] w-full max-w-[260px] !aspect-auto"
      >
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => {
                  const itemConfig =
                    balanceChartConfig[name as keyof typeof balanceChartConfig];
                  return [
                    `${value} días`,
                    itemConfig?.label ?? name,
                  ];
                }}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            strokeWidth={2}
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  balanceChartConfig[
                    entry.name as keyof typeof balanceChartConfig
                  ].color
                }
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="space-y-3">
        <DonutLegend
          label="Disponibles"
          value={balance.diasDisponibles}
          colorClass="bg-emerald-500"
        />
        <DonutLegend
          label="Tomados"
          value={balance.diasTomados}
          colorClass="bg-amber-500"
        />
        <Separator />
        <p className="text-xs text-muted-foreground">
          {balance.diasTomados} tomados · {balance.diasDisponibles}{" "}
          disponibles
        </p>
      </div>
    </div>
  );
}

function DonutLegend({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-sm ${colorClass}`} aria-hidden />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-semibold tabular-nums">
        {value} días
      </span>
    </div>
  );
}

/**
 * Manual setter for the VacationBalance. The Service uses Prisma's atomic
 * `upsert` so this form simply overwrites the current (diasDisponibles,
 * diasTomados) tuple on submit.
 */
function SetBalanceForm({
  colaboradorId,
  initial,
  onDone,
  onCancel,
}: {
  colaboradorId: string;
  initial: VacationBalanceDto;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [disponiblesError, setDisponiblesError] = useState<string | null>(
    null
  );
  const [tomadosError, setTomadosError] = useState<string | null>(null);

  const setBalance = useSetVacationBalance(colaboradorId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const disponibles = Number(fd.get("diasDisponibles") ?? "");
    const tomados = Number(fd.get("diasTomados") ?? "");

    const newDispError =
      Number.isInteger(disponibles) && disponibles >= 0
        ? null
        : "Días disponibles inválido";
    const newTomError =
      Number.isInteger(tomados) && tomados >= 0 ? null : "Días tomados inválido";

    setDisponiblesError(newDispError);
    setTomadosError(newTomError);
    if (newDispError || newTomError) return;

    fd.set("colaboradorId", colaboradorId);
    setBalance.mutate(fd, { onSuccess: () => onDone() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FieldGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field data-invalid={Boolean(disponiblesError)}>
            <FieldLabel>Días disponibles</FieldLabel>
            <Input
              name="diasDisponibles"
              type="number"
              min={0}
              defaultValue={initial.diasDisponibles}
            />
            {disponiblesError ? (
              <FieldError errors={[{ message: disponiblesError } as never]} />
            ) : null}
          </Field>
          <Field data-invalid={Boolean(tomadosError)}>
            <FieldLabel>Días tomados</FieldLabel>
            <Input
              name="diasTomados"
              type="number"
              min={0}
              defaultValue={initial.diasTomados}
            />
            {tomadosError ? (
              <FieldError errors={[{ message: tomadosError } as never]} />
            ) : null}
          </Field>
        </div>
      </FieldGroup>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={setBalance.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={setBalance.isPending}>
          {setBalance.isPending ? "Guardando…" : "Guardar balance"}
        </Button>
      </div>
    </form>
  );
}

/* ── Absence registry grouped by tipo ──────────────────────────────────────── */

function AbsenceRegistry({ colaboradorId }: { colaboradorId: string }) {
  const { data, isLoading } = useAbsenceRecords(colaboradorId);

  const grouped = useMemo(() => {
    const records = data ?? [];
    const out: Record<
      AbsenceRecordDto["tipo"],
      AbsenceRecordDto[]
    > = {
      VACACIONES: [],
      LICENCIA: [],
      INCAPACIDAD: [],
    };
    for (const r of records) out[r.tipo].push(r);
    return out;
  }, [data]);

  const recordCount = data?.length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarOff className="h-4 w-4" />
          Registro de ausencias
        </CardTitle>
        <CardDescription>
          Historial agrupado por tipo. Los días se calculan como la diferencia
          inclusiva entre la fecha de inicio y la fecha de fin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Cargando ausencias…
          </p>
        ) : recordCount === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>Sin ausencias registradas</EmptyTitle>
              <EmptyDescription>
                Aún no se ha registrado ninguna ausencia para este
                colaborador.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          AUSENCIA_ORDER.map((tipo) => (
            <AbsenceGroup
              key={tipo}
              tipo={tipo}
              records={grouped[tipo]}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function AbsenceGroup({
  tipo,
  records,
}: {
  tipo: AbsenceRecordDto["tipo"];
  records: AbsenceRecordDto[];
}) {
  const meta = AUSENCIA_LABELS[tipo];
  const Icon = meta.icon;
  const totalDias = records.reduce((acc, r) => acc + r.dias, 0);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{meta.label}</h3>
          <Badge variant="secondary" className="text-[10px]">
            {records.length}
          </Badge>
        </div>
        {records.length > 0 ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {totalDias} día{totalDias === 1 ? "" : "s"} en total
          </span>
        ) : null}
      </div>

      {records.length === 0 ? (
        <p className="text-xs text-muted-foreground italic pl-6">
          Sin entradas en este grupo.
        </p>
      ) : (
        <ul className="divide-y rounded-md border bg-card">
          {records.map((r) => (
            <li
              key={r.id}
              className="flex items-start justify-between gap-3 p-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-medium">
                  {formatDateRange(r.fechaInicio, r.fechaFin)}
                  <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                    · {r.dias} día{r.dias === 1 ? "" : "s"}
                  </span>
                </div>
                {r.motivo ? (
                  <p className="text-xs text-muted-foreground">{r.motivo}</p>
                ) : null}
              </div>
              <Badge variant="outline" className="shrink-0">
                {formatDias(r.dias)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ── Create absence form ───────────────────────────────────────────────────── */

function CreateAbsenceCard({ colaboradorId }: { colaboradorId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Registrar ausencia
            </CardTitle>
            <CardDescription>
              Registra una nueva ausencia (vacaciones, licencia o
              incapacidad). Los días se calculan automáticamente como la
              diferencia inclusiva entre las fechas.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Nueva ausencia
          </Button>
        </CardHeader>
      </Card>
      {open ? (
        <CreateAbsenceDialog
          open={open}
          onOpenChange={setOpen}
          colaboradorId={colaboradorId}
        />
      ) : null}
    </>
  );
}

function CreateAbsenceDialog({
  open,
  onOpenChange,
  colaboradorId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  colaboradorId: string;
}) {
  const [tipo, setTipo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [errors, setErrors] = useState<{
    tipo?: string;
    fechaInicio?: string;
    fechaFin?: string;
    motivo?: string;
  }>({});

  const create = useCreateAbsence(colaboradorId);

  const reset = () => {
    setTipo("");
    setFechaInicio("");
    setFechaFin("");
    setMotivo("");
    setErrors({});
  };

  const handleClose = (next: boolean) => {
    if (create.isPending) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!tipo) newErrors.tipo = "Selecciona un tipo";
    if (!fechaInicio) newErrors.fechaInicio = "La fecha de inicio es requerida";
    if (!fechaFin) newErrors.fechaFin = "La fecha de fin es requerida";

    let computedDias = 0;
    if (!newErrors.fechaInicio && !newErrors.fechaFin) {
      // Parse the "YYYY-MM-DD" form strings through LOCAL parts. Using
      // `new Date("YYYY-MM-DD")` here parsed as UTC midnight, which in a
      // negative-offset timezone (America/Mexico_City, UTC-6) lands on the
      // PREVIOUS day at 18:00 local — that shifted the inclusive-days count
      // by one. `parseYmdToDate` builds the Date from local parts, so the
      // count matches the calendar days the user actually picked.
      const start = parseYmdToDate(fechaInicio);
      const end = parseYmdToDate(fechaFin);
      if (!start || !end) {
        if (!newErrors.fechaInicio) newErrors.fechaInicio = "Fecha inválida";
        if (!newErrors.fechaFin) newErrors.fechaFin = "Fecha inválida";
      } else if (end.getTime() < start.getTime()) {
        newErrors.fechaFin =
          "La fecha de fin no puede ser anterior a la fecha de inicio";
      } else {
        // Mirror the SERVICE math (inclusive calendar days). The server
        // recomputes this value, so a tampered client cannot force a
        // negative `dias`.
        computedDias = differenceInCalendarDays(end, start) + 1;
      }
    }

    if (motivo.length > 500) {
      newErrors.motivo = "El motivo no puede exceder 500 caracteres";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const fd = new FormData();
    fd.set("tipo", tipo);
    fd.set("fechaInicio", fechaInicio);
    fd.set("fechaFin", fechaFin);
    fd.set("motivo", motivo);
    fd.set("dias", String(computedDias));
    fd.set("colaboradorId", colaboradorId);

    create.mutate(fd, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar ausencia</DialogTitle>
          <DialogDescription>
            Captura el tipo, las fechas y un motivo opcional. El servidor
            recalcula los días para garantizar la regla inclusiva.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field data-invalid={Boolean(errors.tipo)}>
              <FieldLabel>Tipo</FieldLabel>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  {AUSENCIA_ORDER.map((t) => (
                    <SelectItem key={t} value={t}>
                      {AUSENCIA_LABELS[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo ? (
                <FieldError errors={[{ message: errors.tipo } as never]} />
              ) : null}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field data-invalid={Boolean(errors.fechaInicio)}>
                <FieldLabel>Fecha de inicio</FieldLabel>
                <DatePicker
                  date={parseYmdToDate(fechaInicio)}
                  onDateChange={(d) => setFechaInicio(formatDateToYmd(d))}
                  placeholder="Selecciona una fecha"
                />
                {errors.fechaInicio ? (
                  <FieldError
                    errors={[{ message: errors.fechaInicio } as never]}
                  />
                ) : null}
              </Field>

              <Field data-invalid={Boolean(errors.fechaFin)}>
                <FieldLabel>Fecha de fin</FieldLabel>
                <DatePicker
                  date={parseYmdToDate(fechaFin)}
                  onDateChange={(d) => setFechaFin(formatDateToYmd(d))}
                  placeholder="Selecciona una fecha"
                />
                {errors.fechaFin ? (
                  <FieldError
                    errors={[{ message: errors.fechaFin } as never]}
                  />
                ) : null}
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.motivo)}>
              <FieldLabel>Motivo (opcional)</FieldLabel>
              <Input
                name="motivo"
                placeholder="Ej. Vacaciones anuales"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
              {errors.motivo ? (
                <FieldError
                  errors={[{ message: errors.motivo } as never]}
                />
              ) : null}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleClose(false)}
              disabled={create.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={create.isPending}>
              {create.isPending ? "Registrando…" : "Registrar ausencia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Format helpers ────────────────────────────────────────────────────────── */

/**
 * Format a date range as `dd MMM yyyy – dd MMM yyyy` using the es locale.
 * Falls back to the raw ISO if either value is unparseable.
 *
 * The DTO serializes these dates with `Date.toISOString()`, i.e. the absence
 * dates are stored as UTC-midnight of the picked "YYYY-MM-DD" day. Reading
 * them back with LOCAL formatting (the previous `format(new Date(iso), …)`)
 * shifted the displayed day backwards in negative-offset timezones
 * (America/Mexico_City, UTC-6). We rebuild each Date from its UTC parts so the
 * rendered day always equals the day the user originally selected, regardless
 * of the viewer's timezone.
 */
function formatDateRange(startIso: string, endIso: string): string {
  try {
    const start = utcDateFromIso(startIso);
    const end = utcDateFromIso(endIso);
    if (!start || !end) {
      return `${startIso} – ${endIso}`;
    }
    const sameYear = start.getFullYear() === end.getFullYear();
    const startStr = format(start, sameYear ? "d MMM" : "d MMM yyyy", {
      locale: es,
    });
    const endStr = format(end, "d MMM yyyy", { locale: es });
    return `${startStr} – ${endStr}`;
  } catch {
    return `${startIso} – ${endIso}`;
  }
}

/**
 * Rebuild a local Date carrying the UTC calendar day of an ISO string. This
 * cancels the timezone shift for dates that were stored as UTC-midnight of a
 * "YYYY-MM-DD" value, so the displayed day matches the stored day. Returns
 * `undefined` when the ISO is unparseable.
 */
function utcDateFromIso(iso: string): Date | undefined {
  const parsed = new Date(iso);
  if (!Number.isFinite(parsed.getTime())) return undefined;
  return new Date(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate()
  );
}

function formatDias(dias: number): string {
  return `${dias} día${dias === 1 ? "" : "s"}`;
}