"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { CurrencyInput } from "@/core/shared/components/CurrencyInput";
import { Input } from "@/core/shared/ui/input";
import { Separator } from "@/core/shared/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { Spinner } from "@/core/shared/ui/spinner";
import { Textarea } from "@/core/shared/ui/textarea";
import { DatePicker } from "@/core/shared/ui/date-picker";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { cn } from "@/core/lib/utils";
import { useSocios } from "@/features/RecursosHumanos/socios/hooks/useSocios.hook";
import { useMovimientoById } from "../hooks/useMovimientoById.hook";
import { useUpdateMovimiento } from "../hooks/useUpdateMovimiento.hook";
import {
  movimientoCargoAbonoOptions,
  movimientoCategoriaOptions,
  movimientoFacturadoPorOptions,
  movimientoFormaPagoOptions,
} from "../schemas/createMovimientoSchema";
import {
  updateMovimientoSchema,
  type UpdateMovimientoFormValues,
} from "../schemas/updateMovimientoSchema";
import type { MovimientoDto } from "../server/dtos/MovimientoDto.dto";
import { ClienteProveedorCombobox } from "./ClienteProveedorCombobox";
import { TitularSelect } from "./TitularSelect";
import { MovimientoFormField, SectionHeader } from "./forms/MovimientoFormField";
import { EnumSelect } from "./forms/EnumSelect";
import { SocioSelect } from "./forms/SocioSelect";

// ─── Badge class maps (mirrors MovimientoDetailSheet) ────────────────────────
const TIPO_BADGE: Record<string, string> = {
  INGRESO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0",
  EGRESO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0",
};

const ESTADO_BADGE: Record<string, string> = {
  PAGADO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0",
  PENDIENTE: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-0",
  CANCELADO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNullable = (value?: string) => (value?.trim() ? value : null);

/** Normalize an ISO date string (or date-only) to "yyyy-MM-dd" for the DatePicker. */
const toDateStr = (value?: string | null): string => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return value.slice(0, 10);
  }
};

/** Convert "yyyy-MM-dd" string to Date for the DatePicker. */
const strToDate = (value: string): Date | undefined => {
  if (!value) return undefined;
  try {
    return parse(value, "yyyy-MM-dd", new Date());
  } catch {
    return undefined;
  }
};

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = UpdateMovimientoFormValues & { tipo: "INGRESO" | "EGRESO" };

function getFormValues(movimiento: MovimientoDto): FormState {
  return {
    id: movimiento.id,
    tipo: movimiento.tipo as "INGRESO" | "EGRESO",
    titular: movimiento.titular,
    estadoCuenta: movimiento.estadoCuenta,
    fechaCorte: toDateStr(movimiento.fechaCorte),
    fechaOperacion: toDateStr(movimiento.fechaOperacion),
    descripcionLiteral: movimiento.descripcionLiteral,
    monto: Number(movimiento.monto),
    concepto: movimiento.concepto ?? "",
    descripcionAdministracion: movimiento.descripcionAdministracion ?? "",
    categoria: movimiento.categoria ?? "",
    formaPago: movimiento.formaPago ?? "",
    cargoAbono: movimiento.cargoAbono ?? "",
    facturadoPor: movimiento.facturadoPor ?? "",
    periodo: movimiento.periodo ?? "",
    numeroFactura: movimiento.numeroFactura ?? "",
    folioFiscal: movimiento.folioFiscal ?? "",
    proveedor: movimiento.proveedor ?? "",
    proveedorId: movimiento.proveedorId ?? "",
    cliente: movimiento.cliente ?? "",
    clienteId: movimiento.clienteId ?? "",
    solicitanteId: movimiento.solicitanteId ?? "",
    autorizadorId: movimiento.autorizadorId ?? "",
    notas: movimiento.notas ?? "",
    facturaId: movimiento.facturaId ?? "",
    estado: (movimiento.estado as FormState["estado"]) ?? "PAGADO",
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditMovimientoSheetProps {
  movimientoId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditMovimientoSheet({ movimientoId, isOpen, onClose }: EditMovimientoSheetProps) {
  const isMobile = useIsMobile();
  const mutation = useUpdateMovimiento();
  const { data: socios = [] } = useSocios();
  const {
    data: movimiento,
    isPending,
    isError,
    error,
  } = useMovimientoById(isOpen ? movimientoId ?? undefined : undefined);

  const [values, setValues] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setValues(null);
      return;
    }
    if (!movimiento) {
      setValues(null);
      return;
    }
    setValues(getFormValues(movimiento));
    setErrors({});
  }, [movimiento, isOpen]);

  const sociosActivos = useMemo(() => socios.filter((s) => s.activo), [socios]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!values) return;

    const { tipo: _tipo, ...candidate } = values;
    const parsed = updateMovimientoSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
        )
      );
      return;
    }

    try {
      await mutation.mutateAsync({
        ...parsed.data,
        categoria: parsed.data.categoria || null,
        formaPago: parsed.data.formaPago || null,
        cargoAbono: parsed.data.cargoAbono || null,
        facturadoPor: parsed.data.facturadoPor || null,
        periodo: parsed.data.periodo || null,
        numeroFactura: parsed.data.numeroFactura || null,
        folioFiscal: parsed.data.folioFiscal || null,
        concepto: parsed.data.concepto || null,
        descripcionAdministracion: parsed.data.descripcionAdministracion || null,
        proveedor: parsed.data.proveedor || null,
        cliente: parsed.data.cliente || null,
        proveedorId: toNullable(parsed.data.proveedorId),
        clienteId: toNullable(parsed.data.clienteId),
        solicitanteId: toNullable(parsed.data.solicitanteId),
        autorizadorId: toNullable(parsed.data.autorizadorId),
        facturaId: toNullable(parsed.data.facturaId),
        notas: parsed.data.notas || null,
      });
      onClose();
    } catch {
      // Error feedback handled by onError in useUpdateMovimiento (toast).
    }
  };

  const partyKind = values?.tipo === "INGRESO" ? "cliente" : "proveedor";
  const partyLabel = values?.tipo === "INGRESO" ? "Cliente" : "Proveedor";

  // Truncated title for the sheet header
  const titleText = movimiento?.descripcionLiteral
    ? movimiento.descripcionLiteral.length > 60
      ? movimiento.descripcionLiteral.slice(0, 57) + "..."
      : movimiento.descripcionLiteral
    : "Editar movimiento";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "ml-0 p-0 w-full sm:max-w-2xl flex flex-col overflow-hidden",
          isMobile ? "rounded-t-2xl max-h-[92dvh]" : "rounded-2xl h-full"
        )}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b shrink-0">
          <p className="text-xs text-muted-foreground font-medium mb-1">Editar movimiento</p>
          <SheetTitle className="text-lg font-semibold truncate leading-tight">
            {titleText}
          </SheetTitle>
          {movimiento && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge
                variant="secondary"
                className={cn("text-xs", TIPO_BADGE[movimiento.tipo] ?? "")}
              >
                {movimiento.tipo}
              </Badge>
              <Badge
                variant="secondary"
                className={cn("text-xs", ESTADO_BADGE[movimiento.estado] ?? "")}
              >
                {movimiento.estado}
              </Badge>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isError ? (
            <div className="py-8 text-sm text-destructive">
              {error instanceof Error ? error.message : "Error al cargar movimiento"}
            </div>
          ) : isPending || !movimiento || !values ? (
            <div className="flex h-full min-h-72 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : (
            <form id="edit-movimiento-form" onSubmit={submit} className="space-y-6">

              {/* ── Estado ──────────────────────────────────────────────── */}
              <div>
                <SectionHeader title="Estado" />
                <div className="space-y-4">
                  <MovimientoFormField label="Estado" error={errors.estado}>
                    <EnumSelect
                      value={values.estado ?? ""}
                      placeholder="Seleccioná un estado"
                      options={["PAGADO", "PENDIENTE", "CANCELADO"] as const}
                      onChange={(v) => update("estado", v as FormState["estado"])}
                      allowEmpty={false}
                    />
                  </MovimientoFormField>
                </div>
              </div>

              <Separator />

              {/* ── Identificación ──────────────────────────────────────── */}
              <div>
                <SectionHeader title="Identificación" />
                <div className="space-y-4">
                  {/* Titular — full row */}
                  <MovimientoFormField label="Titular" error={errors.titular} required>
                    <TitularSelect
                      value={values.titular ?? ""}
                      onChange={(v) => update("titular", v)}
                    />
                  </MovimientoFormField>

                  {/* Estado de cuenta + Monto */}
                  <div className="grid grid-cols-2 gap-4">
                    <MovimientoFormField label="Estado de cuenta" error={errors.estadoCuenta} required>
                      <Input
                        value={values.estadoCuenta ?? ""}
                        onChange={(e) => update("estadoCuenta", e.target.value)}
                        className={cn(errors.estadoCuenta && "border-destructive")}
                      />
                    </MovimientoFormField>

                    <MovimientoFormField label="Monto" error={errors.monto} required>
                      <CurrencyInput
                        value={values.monto ?? 0}
                        onChange={(v) => update("monto", v)}
                        aria-invalid={!!errors.monto}
                        className={cn(errors.monto && "border-destructive")}
                      />
                    </MovimientoFormField>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── Operación ────────────────────────────────────────────── */}
              <div>
                <SectionHeader title="Operación" />
                <div className="space-y-4">
                  {/* Fecha operación + Fecha corte */}
                  <div className="grid grid-cols-2 gap-4">
                    <MovimientoFormField label="Fecha de operación" error={errors.fechaOperacion} required>
                      <DatePicker
                        date={strToDate(values.fechaOperacion ?? "")}
                        onDateChange={(d) =>
                          update("fechaOperacion", d ? format(d, "yyyy-MM-dd") : "")
                        }
                      />
                    </MovimientoFormField>

                    <MovimientoFormField label="Fecha de corte" error={errors.fechaCorte} required>
                      <DatePicker
                        date={strToDate(values.fechaCorte ?? "")}
                        onDateChange={(d) =>
                          update("fechaCorte", d ? format(d, "yyyy-MM-dd") : "")
                        }
                      />
                    </MovimientoFormField>
                  </div>

                  {/* Forma de pago + Cargo / Abono */}
                  <div className="grid grid-cols-2 gap-4">
                    <MovimientoFormField label="Forma de pago">
                      <EnumSelect
                        value={values.formaPago ?? ""}
                        placeholder="Seleccioná una forma de pago"
                        options={movimientoFormaPagoOptions}
                        onChange={(v) => update("formaPago", v)}
                      />
                    </MovimientoFormField>

                    <MovimientoFormField label="Cargo / Abono">
                      <EnumSelect
                        value={values.cargoAbono ?? ""}
                        placeholder="Seleccioná un origen"
                        options={movimientoCargoAbonoOptions}
                        onChange={(v) => update("cargoAbono", v)}
                      />
                    </MovimientoFormField>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── Descripción ──────────────────────────────────────────── */}
              <div>
                <SectionHeader title="Descripción" />
                <div className="space-y-4">
                  {/* Descripción literal — full row */}
                  <MovimientoFormField label="Descripción literal" error={errors.descripcionLiteral} required>
                    <Textarea
                      value={values.descripcionLiteral ?? ""}
                      onChange={(e) => update("descripcionLiteral", e.target.value)}
                      className={cn(errors.descripcionLiteral && "border-destructive")}
                      rows={3}
                    />
                  </MovimientoFormField>

                  {/* Descripción administrativa — full row */}
                  <MovimientoFormField label="Descripción administrativa">
                    <Textarea
                      value={values.descripcionAdministracion ?? ""}
                      onChange={(e) => update("descripcionAdministracion", e.target.value)}
                      rows={2}
                    />
                  </MovimientoFormField>

                  {/* Notas — full row */}
                  <MovimientoFormField label="Notas">
                    <Textarea
                      value={values.notas ?? ""}
                      onChange={(e) => update("notas", e.target.value)}
                      rows={2}
                    />
                  </MovimientoFormField>

                  {/* Concepto + Categoría */}
                  <div className="grid grid-cols-2 gap-4">
                    <MovimientoFormField label="Concepto">
                      <Input
                        value={values.concepto ?? ""}
                        onChange={(e) => update("concepto", e.target.value)}
                      />
                    </MovimientoFormField>

                    <MovimientoFormField label="Categoría">
                      <EnumSelect
                        value={values.categoria ?? ""}
                        placeholder="Seleccioná una categoría"
                        options={movimientoCategoriaOptions}
                        onChange={(v) => update("categoria", v)}
                      />
                    </MovimientoFormField>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── Contraparte ──────────────────────────────────────────── */}
              <div>
                <SectionHeader title="Contraparte" />
                <div className="space-y-4">
                  <ClienteProveedorCombobox
                    kind={partyKind}
                    label={partyLabel}
                    value={partyKind === "cliente" ? values.cliente ?? "" : values.proveedor ?? ""}
                    selectedId={
                      partyKind === "cliente"
                        ? values.clienteId ?? null
                        : values.proveedorId ?? null
                    }
                    onChange={({ value: v, selectedId }) =>
                      partyKind === "cliente"
                        ? setValues((prev) =>
                            prev ? { ...prev, cliente: v, clienteId: selectedId ?? "" } : prev
                          )
                        : setValues((prev) =>
                            prev ? { ...prev, proveedor: v, proveedorId: selectedId ?? "" } : prev
                          )
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* ── Aprobaciones ─────────────────────────────────────────── */}
              <div>
                <SectionHeader title="Aprobaciones" />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <MovimientoFormField label="Solicitado por">
                      <SocioSelect
                        value={values.solicitanteId ?? ""}
                        options={sociosActivos}
                        onChange={(v) => update("solicitanteId", v)}
                      />
                    </MovimientoFormField>

                    <MovimientoFormField label="Autorizado por">
                      <SocioSelect
                        value={values.autorizadorId ?? ""}
                        options={sociosActivos}
                        onChange={(v) => update("autorizadorId", v)}
                      />
                    </MovimientoFormField>
                  </div>

                  <MovimientoFormField label="Facturado por">
                    <EnumSelect
                      value={values.facturadoPor ?? ""}
                      placeholder="Seleccioná quién factura"
                      options={movimientoFacturadoPorOptions}
                      onChange={(v) => update("facturadoPor", v)}
                    />
                  </MovimientoFormField>
                </div>
              </div>

              <Separator />

              {/* ── Referencias fiscales ─────────────────────────────────── */}
              <div>
                <SectionHeader title="Referencias fiscales" />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <MovimientoFormField label="Periodo">
                      <Input
                        value={values.periodo ?? ""}
                        onChange={(e) => update("periodo", e.target.value)}
                      />
                    </MovimientoFormField>

                    <MovimientoFormField label="Nº de factura">
                      <Input
                        value={values.numeroFactura ?? ""}
                        onChange={(e) => update("numeroFactura", e.target.value)}
                      />
                    </MovimientoFormField>
                  </div>

                  <MovimientoFormField label="Folio fiscal">
                    <Input
                      value={values.folioFiscal ?? ""}
                      onChange={(e) => update("folioFiscal", e.target.value)}
                    />
                  </MovimientoFormField>
                </div>
              </div>

              {/* ── Submit ───────────────────────────────────────────────── */}
              <Button
                type="submit"
                form="edit-movimiento-form"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
