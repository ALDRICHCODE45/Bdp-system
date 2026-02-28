"use client";

import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Separator } from "@/core/shared/ui/separator";
import { useUpdateFacturaForm } from "../../hooks/useUpdateFacturaForm.hook";
import { FacturaDto } from "../../server/dtos/FacturaDto.dto";
import { DatePicker } from "@/features/Recepcion/entradas-salidas/components/DatePicker";
import { useState } from "react";
import { TriangleAlert, Save } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface EditFacturaFormProps {
  factura: FacturaDto;
  onSuccess?: () => void;
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
      {title}
    </p>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────
function FormField({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {hint && !error && (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const EditFacturaForm = ({
  factura,
  onSuccess,
}: EditFacturaFormProps) => {
  const form = useUpdateFacturaForm(factura, onSuccess);
  const [canEdit, setCanEdit] = useState<boolean>(
    factura.status === "borrador"
  );

  // ── Warning banner for non-borrador facturas ──────────────────────────────
  const WarningBanner = !canEdit && (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 mb-5">
      <div className="flex items-start gap-3">
        <TriangleAlert className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Factura en estado{" "}
            <span className="font-bold uppercase">{factura.status}</span>
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            Se recomienda editar solo facturas en estado{" "}
            <span className="font-semibold">Borrador</span>. Modificar una
            factura emitida puede generar inconsistencias fiscales.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900/40"
            onClick={() => setCanEdit(true)}
          >
            Editar de todos modos
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <form
      id="edit-factura-form"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {WarningBanner}

      <fieldset disabled={!canEdit} className={cn(!canEdit && "opacity-50 pointer-events-none")}>
        <div className="space-y-6">

          {/* ── Identificación ──────────────────────────────────────────────── */}
          <div>
            <SectionHeader title="Identificación" />
            <div className="space-y-4">
              {/* UUID — full width */}
              <form.Field name="uuid">
                {(field) => {
                  const error =
                    field.state.meta.isTouched && !field.state.meta.isValid
                      ? (field.state.meta.errors[0] as string | undefined)
                      : null;
                  return (
                    <FormField label="UUID" hint="Fiscal CFDI" error={error} required>
                      <Input
                        id="uuid"
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={!!error}
                        className={cn(error && "border-destructive focus-visible:ring-destructive")}
                        placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                        spellCheck={false}
                      />
                    </FormField>
                  );
                }}
              </form.Field>

              {/* Concepto — full width */}
              <form.Field name="concepto">
                {(field) => {
                  const error =
                    field.state.meta.isTouched && !field.state.meta.isValid
                      ? (field.state.meta.errors[0] as string | undefined)
                      : null;
                  return (
                    <FormField label="Concepto" hint="Descripción del servicio" error={error} required>
                      <Input
                        id="concepto"
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={!!error}
                        className={cn(error && "border-destructive focus-visible:ring-destructive")}
                      />
                    </FormField>
                  );
                }}
              </form.Field>

              {/* Serie + Folio — 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="serie">
                  {(field) => (
                    <FormField label="Serie" hint="Opcional">
                      <Input
                        id="serie"
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="A"
                      />
                    </FormField>
                  )}
                </form.Field>

                <form.Field name="folio">
                  {(field) => (
                    <FormField label="Folio" hint="Opcional">
                      <Input
                        id="folio"
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="001"
                      />
                    </FormField>
                  )}
                </form.Field>
              </div>

              {/* Uso CFDI + Moneda — 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="usoCfdi">
                  {(field) => (
                    <FormField label="Uso CFDI" hint="Opcional">
                      <Input
                        id="usoCfdi"
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="G03, P01…"
                      />
                    </FormField>
                  )}
                </form.Field>

                <form.Field name="moneda">
                  {(field) => {
                    const error =
                      field.state.meta.isTouched && !field.state.meta.isValid
                        ? (field.state.meta.errors[0] as string | undefined)
                        : null;
                    return (
                      <FormField label="Moneda" error={error} required>
                        <Select
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(v) => field.handleChange(v)}
                        >
                          <SelectTrigger id="moneda" aria-invalid={!!error}>
                            <SelectValue placeholder="Moneda" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MXN">MXN — Peso mexicano</SelectItem>
                            <SelectItem value="USD">USD — Dólar</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    );
                  }}
                </form.Field>
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Montos ──────────────────────────────────────────────────────── */}
          <div>
            <SectionHeader title="Montos" />
            <div className="space-y-4">
              {/* Subtotal + Total — 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="subtotal">
                  {(field) => {
                    const error =
                      field.state.meta.isTouched && !field.state.meta.isValid
                        ? (field.state.meta.errors[0] as string | undefined)
                        : null;
                    return (
                      <FormField label="Subtotal" hint="Antes de impuestos" error={error} required>
                        <Input
                          id="subtotal"
                          name={field.name}
                          type="number"
                          step="0.01"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(parseFloat(e.target.value) || 0)
                          }
                          aria-invalid={!!error}
                          className={cn(error && "border-destructive")}
                        />
                      </FormField>
                    );
                  }}
                </form.Field>

                <form.Field name="total">
                  {(field) => {
                    const error =
                      field.state.meta.isTouched && !field.state.meta.isValid
                        ? (field.state.meta.errors[0] as string | undefined)
                        : null;
                    return (
                      <FormField label="Total" hint="Monto final" error={error} required>
                        <Input
                          id="total"
                          name={field.name}
                          type="number"
                          step="0.01"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(parseFloat(e.target.value) || 0)
                          }
                          aria-invalid={!!error}
                          className={cn(error && "border-destructive")}
                        />
                      </FormField>
                    );
                  }}
                </form.Field>
              </div>

              {/* Imp. Trasladados + Imp. Retenidos — 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="totalImpuestosTransladados">
                  {(field) => (
                    <FormField label="Imp. Trasladados" hint="Opcional">
                      <Input
                        id="totalImpuestosTransladados"
                        name={field.name}
                        type="number"
                        step="0.01"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormField>
                  )}
                </form.Field>

                <form.Field name="totalImpuestosRetenidos">
                  {(field) => (
                    <FormField label="Imp. Retenidos" hint="Opcional">
                      <Input
                        id="totalImpuestosRetenidos"
                        name={field.name}
                        type="number"
                        step="0.01"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormField>
                  )}
                </form.Field>
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Status y Pago ────────────────────────────────────────────────── */}
          <div>
            <SectionHeader title="Status y Pago" />
            <div className="space-y-4">
              {/* Status + Método de Pago — 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="status">
                  {(field) => {
                    const error =
                      field.state.meta.isTouched && !field.state.meta.isValid
                        ? (field.state.meta.errors[0] as string | undefined)
                        : null;
                    return (
                      <FormField label="Status" error={error} required>
                        <Select
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(v) =>
                            field.handleChange(
                              v as "borrador" | "enviada" | "pagada" | "cancelada"
                            )
                          }
                        >
                          <SelectTrigger id="status" aria-invalid={!!error}>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="borrador">Borrador</SelectItem>
                            <SelectItem value="enviada">Enviada</SelectItem>
                            <SelectItem value="pagada">Pagada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    );
                  }}
                </form.Field>

                <form.Field name="metodoPago">
                  {(field) => (
                    <FormField label="Método de Pago" hint="PUE / PPD">
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v)}
                      >
                        <SelectTrigger id="metodoPago">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUE">PUE — Pago en una exhibición</SelectItem>
                          <SelectItem value="PPD">PPD — Pago en parcialidades</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                </form.Field>
              </div>

              {/* Status Pago + Fecha de Pago — 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="statusPago">
                  {(field) => (
                    <FormField label="Status de Pago" hint="Opcional">
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v)}
                      >
                        <SelectTrigger id="statusPago">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vigente">Vigente</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                </form.Field>

                <form.Field name="fechaPago">
                  {(field) => (
                    <FormField label="Fecha de Pago" hint="Opcional">
                      <DatePicker
                        date={
                          field.state.value
                            ? new Date(field.state.value)
                            : undefined
                        }
                        onDateChange={(date) => {
                          field.handleChange(
                            date ? date.toISOString().split("T")[0] : ""
                          );
                        }}
                      />
                    </FormField>
                  )}
                </form.Field>
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Datos Fiscales ───────────────────────────────────────────────── */}
          <div>
            <SectionHeader title="Datos Fiscales" />
            <div className="space-y-4">
              {/* RFC Emisor + Nombre Emisor — 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="rfcEmisor">
                  {(field) => {
                    const error =
                      field.state.meta.isTouched && !field.state.meta.isValid
                        ? (field.state.meta.errors[0] as string | undefined)
                        : null;
                    return (
                      <FormField label="RFC Emisor" hint="12–13 chars" error={error} required>
                        <Input
                          id="rfcEmisor"
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.target.value.toUpperCase())
                          }
                          aria-invalid={!!error}
                          maxLength={13}
                          className={cn(
                            "font-mono uppercase",
                            error && "border-destructive"
                          )}
                        />
                      </FormField>
                    );
                  }}
                </form.Field>

                <form.Field name="nombreEmisor">
                  {(field) => (
                    <FormField label="Nombre Emisor" hint="Opcional">
                      <Input
                        id="nombreEmisor"
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FormField>
                  )}
                </form.Field>
              </div>

              {/* RFC Receptor + Nombre Receptor — 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="rfcReceptor">
                  {(field) => {
                    const error =
                      field.state.meta.isTouched && !field.state.meta.isValid
                        ? (field.state.meta.errors[0] as string | undefined)
                        : null;
                    return (
                      <FormField label="RFC Receptor" hint="12–13 chars" error={error} required>
                        <Input
                          id="rfcReceptor"
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.target.value.toUpperCase())
                          }
                          aria-invalid={!!error}
                          maxLength={13}
                          className={cn(
                            "font-mono uppercase",
                            error && "border-destructive"
                          )}
                        />
                      </FormField>
                    );
                  }}
                </form.Field>

                <form.Field name="nombreReceptor">
                  {(field) => (
                    <FormField label="Nombre Receptor" hint="Opcional">
                      <Input
                        id="nombreReceptor"
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FormField>
                  )}
                </form.Field>
              </div>
            </div>
          </div>

        </div>
      </fieldset>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <Button
        type="submit"
        form="edit-factura-form"
        className="w-full gap-2"
        disabled={!canEdit}
      >
        <Save className="size-4" />
        Guardar cambios
      </Button>
    </form>
  );
};
