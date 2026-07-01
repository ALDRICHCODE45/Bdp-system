"use client";

import { useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckSquare,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Square,
  Trash2,
  User as UserIcon,
} from "lucide-react";

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
import {
  FieldGroup,
  FieldLabel,
  Field,
  FieldError,
} from "@/core/shared/ui/field";
import { Separator } from "@/core/shared/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/shared/ui/alert-dialog";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import {
  MODALIDAD_LABELS,
  NIVEL_LABELS,
  TIPO_CONTRATO_LABELS,
} from "../helpers/colaboradorLabels";
import {
  useCreateResponsabilidadCargo,
  useDeleteResponsabilidadCargo,
  useResponsabilidadesCargo,
  useToggleResponsabilidadCargo,
  useUpdateResponsabilidadCargo,
} from "../hooks/useResponsabilidadesCargo.hook";

interface LaboralTabProps {
  colaborador: ColaboradorDto;
}

/**
 * P3 — cap5 colaborador profile: Laboral tab.
 *
 * Two stacked sections:
 *
 * 1. Posición + Contrato / Horario (read-only). Editing happens through the
 *    existing `EditColaboradorSheet`. The "jefe" cell derives from the
 *    `socio` relation — null socioId renders as "Sin socio asignado" per
 *    spec cap5 req1.
 *
 * 2. Responsabilidades del cargo (checklist CRUD via TanStack Query + Server
 *    Actions). All mutations gated by `colaboradores:editar` (CC1/CC8).
 *
 * Spec cap5 req5 enforces ABSENT fields — there is NO `zona horaria` and
 * NO `código interno` rendered anywhere in this tab. That negative
 * requirement is what's being verified by the cap5 scenario.
 */
export function LaboralTab({ colaborador }: LaboralTabProps) {
  return (
    <div className="space-y-6">
      <PosicionYContratoCard colaborador={colaborador} />
      <ResponsabilidadesCargoSection colaboradorId={colaborador.id} />
    </div>
  );
}

/* ── Posición + Contrato / Horario — read-only grid ────────────────── */

function PosicionYContratoCard({ colaborador }: { colaborador: ColaboradorDto }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Posición y contrato
        </CardTitle>
        <CardDescription>
          Cargo, nivel y condiciones contractuales del colaborador. Editables
          desde el botón &quot;Editar&quot; de la barra lateral.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Posición actual
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <LaboralField
            label="Cargo (puesto)"
            value={colaborador.puesto}
            placeholder="Sin registrar"
          />
          <LaboralField
            label="Nivel"
            value={
              colaborador.nivel ? (NIVEL_LABELS[colaborador.nivel] ?? colaborador.nivel) : null
            }
            placeholder="Sin registrar"
          />
          <LaboralField
            label="Departamento"
            value={colaborador.departamento}
            placeholder="Sin registrar"
          />
          <LaboralField
            icon={UserIcon}
            label="Jefe directo (socio)"
            value={colaborador.socio?.nombre ?? null}
            placeholder="Sin socio asignado"
          />
        </div>

        <Separator className="my-6" />

        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Contrato / horario
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <LaboralField
            label="Tipo de contrato"
            value={
              colaborador.tipoContrato
                ? (TIPO_CONTRATO_LABELS[colaborador.tipoContrato] ?? colaborador.tipoContrato)
                : null
            }
            placeholder="Sin registrar"
          />
          <LaboralField
            label="Modalidad"
            value={
              colaborador.modalidad
                ? (MODALIDAD_LABELS[colaborador.modalidad] ?? colaborador.modalidad)
                : null
            }
            placeholder="Sin registrar"
          />
          <LaboralField
            icon={Calendar}
            label="Fecha de ingreso"
            value={formatDate(colaborador.fechaIngreso)}
            placeholder="Sin registrar"
          />
          <LaboralField
            icon={Calendar}
            label="Fecha de salida"
            value={formatDate(colaborador.fechaSalida)}
            placeholder="Sin fecha de salida"
          />
          <LaboralField
            icon={MapPin}
            label="Lugar de trabajo"
            value={colaborador.lugarTrabajo}
            placeholder="Sin registrar"
          />
          <LaboralField
            icon={Clock}
            label="Horario"
            value={colaborador.horario}
            placeholder="Sin registrar"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function LaboralField({
  icon: Icon,
  label,
  value,
  placeholder,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  placeholder: string;
}) {
  const hasValue = value !== null && value !== undefined && value !== "";
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </div>
      <div
        className={
          hasValue
            ? "text-sm font-medium text-foreground break-words"
            : "text-sm italic text-muted-foreground"
        }
      >
        {hasValue ? value : placeholder}
      </div>
    </div>
  );
}

/* ── Responsabilidades del cargo (checklist) ──────────────────────── */

function ResponsabilidadesCargoSection({ colaboradorId }: { colaboradorId: string }) {
  const { data, isLoading } = useResponsabilidadesCargo(colaboradorId);
  const items = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Responsabilidades del cargo
          </CardTitle>
          <CardDescription>
            Lista de tareas y compromisos del puesto. Marca conforme se
            completan.
          </CardDescription>
        </div>
        <PermissionGuard
          permissions={[
            PermissionActions.colaboradores.editar,
            PermissionActions.colaboradores.gestionar,
          ]}
        >
          <AddResponsabilidadForm colaboradorId={colaboradorId} />
        </PermissionGuard>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando responsabilidades…</p>
        ) : items.length === 0 ? (
          <div className="flex items-center gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Aún no hay responsabilidades registradas para este cargo.
            </span>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((r) => (
              <ResponsabilidadRow
                key={r.id}
                item={r}
                colaboradorId={colaboradorId}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ResponsabilidadRow({
  item,
  colaboradorId,
}: {
  item: import("../server/dtos/ResponsabilidadCargoDto.dto").ResponsabilidadCargoDto;
  colaboradorId: string;
}) {
  const toggle = useToggleResponsabilidadCargo(colaboradorId);

  const handleToggleClick = () => {
    toggle.mutate({ id: item.id, completada: !item.completada });
  };

  return (
    <li className="flex items-start gap-3 rounded-md border p-3">
      <button
        type="button"
        onClick={handleToggleClick}
        disabled={toggle.isPending}
        aria-pressed={item.completada}
        aria-label={
          item.completada
            ? `Marcar "${item.descripcion}" como pendiente`
            : `Marcar "${item.descripcion}" como completada`
        }
        className="mt-0.5 rounded-sm hover:bg-muted p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {item.completada ? (
          <CheckSquare className="h-5 w-5 text-primary" />
        ) : (
          <Square className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <div className="min-w-0 flex-1 space-y-1">
        <div
          className={
            item.completada
              ? "text-sm text-muted-foreground line-through"
              : "text-sm font-medium text-foreground"
          }
        >
          {item.descripcion}
        </div>
        {item.completada ? (
          <Badge variant="secondary" className="text-[10px]">
            Completada
          </Badge>
        ) : null}
      </div>
      <PermissionGuard
        permissions={[
          PermissionActions.colaboradores.editar,
          PermissionActions.colaboradores.gestionar,
        ]}
      >
        <EditResponsabilidadButton item={item} colaboradorId={colaboradorId} />
        <DeleteResponsabilidadButton
          id={item.id}
          descripcion={item.descripcion}
          colaboradorId={colaboradorId}
        />
      </PermissionGuard>
    </li>
  );
}

function AddResponsabilidadForm({ colaboradorId }: { colaboradorId: string }) {
  const [open, setOpen] = useState(false);
  const [descripcionError, setDescripcionError] = useState<string | null>(null);

  const create = useCreateResponsabilidadCargo(colaboradorId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const descripcion = (fd.get("descripcion") as string | null)?.trim() ?? "";

    if (!descripcion) {
      setDescripcionError("La descripción es requerida");
      return;
    }
    setDescripcionError(null);

    fd.set("colaboradorId", colaboradorId);

    create.mutate(fd, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
        setDescripcionError(null);
      },
    });
  };

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1">
        <Plus className="h-4 w-4" />
        Agregar
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mt-3 rounded-md border bg-muted/30 p-4 space-y-3"
    >
      <FieldGroup>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(descripcionError)}
          >
            <FieldLabel>Descripción</FieldLabel>
            <Input
              name="descripcion"
              placeholder="Ej. Cerrar reporte financiero mensual"
            />
            {descripcionError ? (
              <FieldError errors={[{ message: descripcionError } as never]} />
            ) : null}
          </Field>
          <Field>
            <FieldLabel>Orden (opcional)</FieldLabel>
            <Input
              name="orden"
              type="number"
              min={0}
              placeholder="0"
              defaultValue={0}
            />
          </Field>
        </div>
      </FieldGroup>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setDescripcionError(null);
          }}
          disabled={create.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={create.isPending}>
          {create.isPending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}

function EditResponsabilidadButton({
  item,
  colaboradorId,
}: {
  item: import("../server/dtos/ResponsabilidadCargoDto.dto").ResponsabilidadCargoDto;
  colaboradorId: string;
}) {
  const [open, setOpen] = useState(false);
  const [descripcionError, setDescripcionError] = useState<string | null>(null);

  const update = useUpdateResponsabilidadCargo(colaboradorId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const descripcion = (fd.get("descripcion") as string | null)?.trim() ?? "";
    if (!descripcion) {
      setDescripcionError("La descripción es requerida");
      return;
    }
    setDescripcionError(null);

    // Ensure the route-bound id is on the form (so the action can pick it up).
    fd.set("id", item.id);

    update.mutate(fd, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label={`Editar responsabilidad ${item.descripcion}`}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-md border bg-card p-4 space-y-3"
          >
            <h3 className="text-sm font-semibold">Editar responsabilidad</h3>
            <FieldGroup>
              <Field
                data-invalid={Boolean(descripcionError)}
              >
                <FieldLabel>Descripción</FieldLabel>
                <Input
                  name="descripcion"
                  defaultValue={item.descripcion}
                  autoFocus
                />
                {descripcionError ? (
                  <FieldError errors={[{ message: descripcionError } as never]} />
                ) : null}
              </Field>
              <Field>
                <FieldLabel>Orden</FieldLabel>
                <Input
                  name="orden"
                  type="number"
                  min={0}
                  defaultValue={item.orden}
                />
              </Field>
            </FieldGroup>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setDescripcionError(null);
                }}
                disabled={update.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={update.isPending}>
                {update.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function DeleteResponsabilidadButton({
  id,
  descripcion,
  colaboradorId,
}: {
  id: string;
  descripcion: string;
  colaboradorId: string;
}) {
  const [open, setOpen] = useState(false);
  const remove = useDeleteResponsabilidadCargo(colaboradorId);

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label={`Eliminar responsabilidad ${descripcion}`}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar responsabilidad</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar la responsabilidad &quot;{descripcion}&quot;? Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                remove.mutate(id, { onSuccess: () => setOpen(false) });
              }}
              disabled={remove.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {remove.isPending ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
