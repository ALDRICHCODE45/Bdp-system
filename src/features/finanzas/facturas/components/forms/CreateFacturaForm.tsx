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
import { DatePicker } from "@/features/Recepcion/entradas-salidas/components/DatePicker";
import { format, parse } from "date-fns";
import { Plus } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { useCreateFacturaForm } from "../../hooks/useCreateFacturaForm.hook";

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

// ─── USO CFDI options ─────────────────────────────────────────────────────────
const USO_CFDI_OPTIONS = [
  { value: "G01", label: "G01 — Adquisición de mercancias" },
  { value: "G02", label: "G02 — Devoluciones, descuentos o bonificaciones" },
  { value: "G03", label: "G03 — Gastos en general" },
  { value: "I01", label: "I01 — Construcciones" },
  { value: "I02", label: "I02 — Mobiliario y equipo de oficina" },
  { value: "I03", label: "I03 — Equipo de transporte" },
  { value: "I04", label: "I04 — Equipo de cómputo y accesorios" },
  { value: "I05", label: "I05 — Dados, troqueles, moldes, matrices y herramental" },
  { value: "I06", label: "I06 — Comunicaciones telefónicas" },
  { value: "I07", label: "I07 — Comunicaciones satelitales" },
  { value: "I08", label: "I08 — Otra maquinaria y equipo" },
  { value: "D01", label: "D01 — Honorarios médicos, dentales y gastos hospitalarios" },
  { value: "D02", label: "D02 — Gastos médicos por incapacidad o discapacidad" },
  { value: "D03", label: "D03 — Gastos funerales" },
  { value: "D04", label: "D04 — Donativos" },
  { value: "D05", label: "D05 — Intereses reales por créditos hipotecarios (casa habitación)" },
  { value: "D06", label: "D06 — Aportaciones voluntarias al SAR" },
  { value: "D07", label: "D07 — Primas por seguros de gastos médicos" },
  { value: "D08", label: "D08 — Gastos de transportación escolar obligatoria" },
  {
    value: "D09",
    label: "D09 — Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones",
  },
  { value: "D10", label: "D10 — Pagos por servicios educativos (colegiaturas)" },
  { value: "CP01", label: "CP01 — Pagos" },
  { value: "S01", label: "S01 — Sin efectos fiscales" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateFacturaFormProps {
  onSuccess?: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const CreateFacturaForm = ({ onSuccess }: CreateFacturaFormProps) => {
  const form = useCreateFacturaForm(onSuccess);

  return (
    <form
      id="create-factura-form"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
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
                <FormField label="UUID" error={error} required>
                  <Input
                    id="uuid"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={!!error}
                    className={cn(
                      error &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
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
                <FormField label="Concepto" error={error} required>
                  <Input
                    id="concepto"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={!!error}
                    className={cn(
                      error &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
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
                  <Select
                    name={field.name}
                    value={field.state.value ?? ""}
                    onValueChange={(v) => field.handleChange(v)}
                  >
                    <SelectTrigger id="usoCfdi">
                      <SelectValue placeholder="Seleccionar uso CFDI" />
                    </SelectTrigger>
                    <SelectContent>
                      {USO_CFDI_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        <SelectItem value="EUR">EUR — Euro</SelectItem>
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
                  <FormField
                    label="Subtotal"
                    hint="Antes de impuestos"
                    error={error}
                    required
                  >
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
                  <FormField
                    label="Total"
                    hint="Monto final"
                    error={error}
                    required
                  >
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
                          v as "borrador" | "enviada" | "pagada" | "cancelada",
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
                      <SelectItem value="PUE">
                        PUE — Pago en una exhibición
                      </SelectItem>
                      <SelectItem value="PPD">
                        PPD — Pago en parcialidades o diferido
                      </SelectItem>
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
                        ? parse(field.state.value, "yyyy-MM-dd", new Date())
                        : undefined
                    }
                    onDateChange={(date) => {
                      field.handleChange(
                        date ? format(date, "yyyy-MM-dd") : "",
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
                  <FormField
                    label="RFC Emisor"
                    hint="12–13 chars"
                    error={error}
                    required
                  >
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
                        error && "border-destructive",
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
                  <FormField
                    label="RFC Receptor"
                    hint="12–13 chars"
                    error={error}
                    required
                  >
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
                        error && "border-destructive",
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

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <Button type="submit" form="create-factura-form" className="w-full gap-2">
        <Plus className="size-4" />
        Crear factura
      </Button>
    </form>
  );
};
