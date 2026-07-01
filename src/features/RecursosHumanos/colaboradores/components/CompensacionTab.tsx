"use client";

import { useState } from "react";
import { Banknote, Briefcase, Calendar, History, Pencil } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { CurrencyInput } from "@/core/shared/components/CurrencyInput";
import { Timeline, type TimelineItem } from "@/core/shared/components/Timeline";
import { DatePicker } from "@/core/shared/ui/date-picker";
import {
  FieldGroup,
  FieldLabel,
  Field,
  FieldError,
} from "@/core/shared/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { Textarea } from "@/core/shared/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";

import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { NIVEL_LABELS } from "../helpers/colaboradorLabels";
import {
  useAdjustPosition,
  usePositionHistory,
} from "../hooks/usePositionHistory.hook";
import {
  useAdjustSalary,
  useSalaryHistory,
} from "../hooks/useSalaryHistory.hook";

interface CompensacionTabProps {
  colaborador: ColaboradorDto;
}

/**
 * P4 — cap6 compensation-history profile tab.
 *
 * Three stacked sections:
 *
 * 1. "Sueldo actual" card — live `Colaborador.sueldo` formatted as MXN, or
 *    "Sin registrar" when null. Adjust button is gated by
 *    `colaboradores:editar` (CC1/CC8).
 *
 * 2. SalaryHistory `<Timeline>` — every salary adjustment for this
 *    colaborador, ordered most-recent-first. NO delete affordance on rows
 *    (cap6 req6 — audit integrity). Rows are fed from the read-only
 *    `useSalaryHistory` hook; the list refetches after a successful
 *    `useAdjustSalary` mutation.
 *
 * 3. PositionHistory `<Timeline>` + "Nuevo" button — same audit contract,
 *    gated by `colaboradores:editar`. The "Nuevo" dialog adjusts the live
 *    `puesto/departamento/nivel` fields AND appends a PositionHistory row
 *    capturing the PREVIOUS values, in a single $transaction (CC5 / cap5
 *    req6 / cap6 req5).
 */
export function CompensacionTab({ colaborador }: CompensacionTabProps) {
  return (
    <div className="space-y-6">
      <SueldoActualCard colaborador={colaborador} />
      <SalaryHistoryCard colaboradorId={colaborador.id} />
      <PositionHistoryCard colaboradorId={colaborador.id} />
    </div>
  );
}

/* ── Sueldo actual ─────────────────────────────────────────────────────── */

function SueldoActualCard({ colaborador }: { colaborador: ColaboradorDto }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            Sueldo actual
          </CardTitle>
          <CardDescription>
            Monto vigente del colaborador. Los ajustes se reflejan en el
            historial y aplican de inmediato al expediente.
          </CardDescription>
        </div>
        <PermissionGuard
          permissions={[
            PermissionActions.colaboradores.editar,
            PermissionActions.colaboradores.gestionar,
          ]}
        >
          <AdjustSalaryTriggerButton
            currentSueldo={colaborador.sueldo}
            colaboradorId={colaborador.id}
          />
        </PermissionGuard>
      </CardHeader>
      <CardContent>
        <div
          className={
            hasSueldo(colaborador.sueldo)
              ? "text-3xl font-semibold tabular-nums"
              : "text-2xl font-semibold text-muted-foreground italic"
          }
        >
          {formatSueldo(colaborador.sueldo)}
        </div>
      </CardContent>
    </Card>
  );
}

function AdjustSalaryTriggerButton({
  currentSueldo,
  colaboradorId,
}: {
  currentSueldo: string;
  colaboradorId: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1">
        <Pencil className="h-4 w-4" />
        Nuevo ajuste
      </Button>
      {open ? (
        <AdjustSalaryDialog
          open={open}
          onOpenChange={setOpen}
          currentSueldo={currentSueldo}
          colaboradorId={colaboradorId}
        />
      ) : null}
    </>
  );
}

function AdjustSalaryDialog({
  open,
  onOpenChange,
  currentSueldo,
  colaboradorId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  currentSueldo: string;
  colaboradorId: string;
}) {
  const adjust = useAdjustSalary(colaboradorId);

  const [fechaEfectiva, setFechaEfectiva] = useState<Date | undefined>(
    new Date()
  );
  const [monto, setMonto] = useState<number>(() => {
    const n = Number(currentSueldo);
    return Number.isFinite(n) ? n : 0;
  });
  const [motivo, setMotivo] = useState("");
  const [errors, setErrors] = useState<{
    fechaEfectiva?: string;
    monto?: string;
    motivo?: string;
  }>({});

  const reset = () => {
    const n = Number(currentSueldo);
    setMonto(Number.isFinite(n) ? n : 0);
    setMotivo("");
    setFechaEfectiva(new Date());
    setErrors({});
  };

  const handleClose = (next: boolean) => {
    if (adjust.isPending) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!fechaEfectiva) {
      nextErrors.fechaEfectiva = "Selecciona la fecha efectiva";
    }
    if (!Number.isFinite(monto) || monto < 0) {
      nextErrors.monto = "Ingresa un monto válido (>= 0)";
    }
    if (motivo.length > 240) {
      nextErrors.motivo = "El motivo no puede exceder 240 caracteres";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const fd = new FormData();
    fd.set("colaboradorId", colaboradorId);
    fd.set("fechaEfectiva", fechaEfectiva!.toISOString());
    // Send the amount as a fixed-3-decimals string so Prisma Decimal(15,3)
    // doesn't truncate micro-cents on the wire.
    fd.set("monto", monto.toFixed(3));
    fd.set("motivo", motivo.trim());

    adjust.mutate(fd, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar ajuste de sueldo</DialogTitle>
          <DialogDescription>
            Actualiza el sueldo vigente del colaborador y deja constancia en
            el historial con la fecha y motivo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FieldGroup>
            <Field data-invalid={Boolean(errors.fechaEfectiva)}>
              <FieldLabel>Fecha efectiva</FieldLabel>
              <DatePicker
                date={fechaEfectiva}
                onDateChange={(d) => setFechaEfectiva(d)}
              />
              {errors.fechaEfectiva ? (
                <FieldError
                  errors={[{ message: errors.fechaEfectiva } as never]}
                />
              ) : null}
            </Field>
            <Field data-invalid={Boolean(errors.monto)}>
              <FieldLabel>Monto (MXN)</FieldLabel>
              <CurrencyInput
                value={monto}
                onChange={setMonto}
                aria-invalid={Boolean(errors.monto)}
              />
              {errors.monto ? (
                <FieldError errors={[{ message: errors.monto } as never]} />
              ) : null}
            </Field>
            <Field data-invalid={Boolean(errors.motivo)}>
              <FieldLabel>Motivo (opcional)</FieldLabel>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={2}
                placeholder="Ej. Ajuste anual 2026"
              />
              {errors.motivo ? (
                <FieldError errors={[{ message: errors.motivo } as never]} />
              ) : null}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleClose(false)}
              disabled={adjust.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={adjust.isPending}>
              {adjust.isPending ? "Guardando…" : "Registrar ajuste"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Salary history timeline ───────────────────────────────────────────── */

function SalaryHistoryCard({ colaboradorId }: { colaboradorId: string }) {
  const { data, isLoading } = useSalaryHistory(colaboradorId);
  const rows = data ?? [];

  const items: TimelineItem[] = rows.map((row) => ({
    id: row.id,
    fecha: row.fechaEfectiva,
    title: `${row.moneda} ${formatAmount(row.monto)}`,
    subtitle: row.motivo ?? "Sin motivo registrado",
    meta: <SalaryHistoryMeta row={row} />,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Historial de sueldo
        </CardTitle>
        <CardDescription>
          Auditoría de ajustes. Más reciente primero.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando historial…</p>
        ) : (
          <Timeline
            items={items}
            emptyState="Aún no hay ajustes de sueldo registrados."
          />
        )}
      </CardContent>
    </Card>
  );
}

function SalaryHistoryMeta({ row }: { row: { createdAt: string } }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide">
      <Calendar className="h-3 w-3" />
      Registrado {formatShortDate(row.createdAt)}
    </span>
  );
}

/* ── Position history timeline ─────────────────────────────────────────── */

function PositionHistoryCard({ colaboradorId }: { colaboradorId: string }) {
  const { data, isLoading } = usePositionHistory(colaboradorId);
  const rows = data ?? [];

  const items: TimelineItem[] = rows.map((row) => ({
    id: row.id,
    fecha: row.fechaEfectiva,
    title: row.cargo,
    subtitle: buildPositionSubtitle(row),
    meta: row.nivel ? (
      <Badge variant="outline">{NIVEL_LABELS[row.nivel] ?? row.nivel}</Badge>
    ) : null,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Historial de posición
          </CardTitle>
          <CardDescription>
            Cambios de cargo, departamento y nivel. Más reciente primero.
          </CardDescription>
        </div>
        <PermissionGuard
          permissions={[
            PermissionActions.colaboradores.editar,
            PermissionActions.colaboradores.gestionar,
          ]}
        >
          <AdjustPositionTriggerButton colaboradorId={colaboradorId} />
        </PermissionGuard>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando historial…</p>
        ) : (
          <Timeline
            items={items}
            emptyState="Aún no hay cambios de posición registrados."
          />
        )}
      </CardContent>
    </Card>
  );
}

function buildPositionSubtitle(row: {
  departamento: string | null;
  motivo: string | null;
}): string {
  const dept = row.departamento ? `Depto: ${row.departamento}` : "";
  const motivo = row.motivo ? `Motivo: ${row.motivo}` : "";
  return [dept, motivo].filter(Boolean).join(" · ") || "Sin motivo registrado";
}

function AdjustPositionTriggerButton({ colaboradorId }: { colaboradorId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1">
        <Pencil className="h-4 w-4" />
        Nuevo
      </Button>
      {open ? (
        <AdjustPositionDialog
          open={open}
          onOpenChange={setOpen}
          colaboradorId={colaboradorId}
        />
      ) : null}
    </>
  );
}

function AdjustPositionDialog({
  open,
  onOpenChange,
  colaboradorId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  colaboradorId: string;
}) {
  const adjust = useAdjustPosition(colaboradorId);

  const [fechaEfectiva, setFechaEfectiva] = useState<Date | undefined>(
    new Date()
  );
  const [cargo, setCargo] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [nivel, setNivel] = useState<string>("");
  const [motivo, setMotivo] = useState("");
  const [errors, setErrors] = useState<{
    fechaEfectiva?: string;
    cargo?: string;
    departamento?: string;
    nivel?: string;
    motivo?: string;
  }>({});

  const reset = () => {
    setFechaEfectiva(new Date());
    setCargo("");
    setDepartamento("");
    setNivel("");
    setMotivo("");
    setErrors({});
  };

  const handleClose = (next: boolean) => {
    if (adjust.isPending) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!fechaEfectiva) {
      nextErrors.fechaEfectiva = "Selecciona la fecha efectiva";
    }
    const trimmedCargo = cargo.trim();
    if (!trimmedCargo) {
      nextErrors.cargo = "El cargo es requerido";
    } else if (trimmedCargo.length > 120) {
      nextErrors.cargo = "El cargo no puede exceder 120 caracteres";
    }
    if (departamento.length > 120) {
      nextErrors.departamento = "El departamento no puede exceder 120 caracteres";
    }
    if (motivo.length > 240) {
      nextErrors.motivo = "El motivo no puede exceder 240 caracteres";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const fd = new FormData();
    fd.set("colaboradorId", colaboradorId);
    fd.set("fechaEfectiva", fechaEfectiva!.toISOString());
    fd.set("cargo", trimmedCargo);
    fd.set("departamento", departamento.trim());
    fd.set("nivel", nivel);
    fd.set("motivo", motivo.trim());

    adjust.mutate(fd, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar cambio de posición</DialogTitle>
          <DialogDescription>
            Define el nuevo cargo del colaborador. El cambio se refleja en la
            pestaña Laboral y deja una entrada en el historial con los
            valores previos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FieldGroup>
            <Field data-invalid={Boolean(errors.fechaEfectiva)}>
              <FieldLabel>Fecha efectiva</FieldLabel>
              <DatePicker
                date={fechaEfectiva}
                onDateChange={(d) => setFechaEfectiva(d)}
              />
              {errors.fechaEfectiva ? (
                <FieldError
                  errors={[{ message: errors.fechaEfectiva } as never]}
                />
              ) : null}
            </Field>
            <Field data-invalid={Boolean(errors.cargo)}>
              <FieldLabel>Cargo (puesto)</FieldLabel>
              <Input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ej. Senior Backend Developer"
              />
              {errors.cargo ? (
                <FieldError errors={[{ message: errors.cargo } as never]} />
              ) : null}
            </Field>
            <Field data-invalid={Boolean(errors.departamento)}>
              <FieldLabel>Departamento (opcional)</FieldLabel>
              <Input
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="Ej. Ingeniería"
              />
              {errors.departamento ? (
                <FieldError
                  errors={[{ message: errors.departamento } as never]}
                />
              ) : null}
            </Field>
            <Field data-invalid={Boolean(errors.nivel)}>
              <FieldLabel>Nivel (opcional)</FieldLabel>
              <Select value={nivel} onValueChange={setNivel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un nivel" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NIVEL_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nivel ? (
                <FieldError errors={[{ message: errors.nivel } as never]} />
              ) : null}
            </Field>
            <Field data-invalid={Boolean(errors.motivo)}>
              <FieldLabel>Motivo (opcional)</FieldLabel>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={2}
                placeholder="Ej. Promoción a Senior"
              />
              {errors.motivo ? (
                <FieldError errors={[{ message: errors.motivo } as never]} />
              ) : null}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleClose(false)}
              disabled={adjust.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={adjust.isPending}>
              {adjust.isPending ? "Guardando…" : "Registrar cambio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Format helpers (client-side presentation only) ────────────────────── */

function formatSueldo(sueldo: string | null | undefined): string {
  if (sueldo === null || sueldo === undefined || sueldo === "") {
    return "Sin registrar";
  }
  const n = Number(sueldo);
  if (!Number.isFinite(n)) return "Sin registrar";
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
  return Number.isFinite(Number(sueldo));
}

function formatAmount(monto: string): string {
  const n = Number(monto);
  if (!Number.isFinite(n)) return monto;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n);
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}