"use client";

import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Separator } from "@/core/shared/ui/separator";
import { Textarea } from "@/core/shared/ui/textarea";
import { DatePicker } from "@/core/shared/ui/date-picker";
import { CurrencyInput } from "@/core/shared/components/CurrencyInput";
import { cn } from "@/core/lib/utils";
import { format, parse } from "date-fns";
import { Plus } from "lucide-react";
import { useSocios } from "@/features/RecursosHumanos/socios/hooks/useSocios.hook";
import { useMemo } from "react";
import {
  movimientoCargoAbonoOptions,
  movimientoCategoriaOptions,
  movimientoFacturadoPorOptions,
  movimientoFormaPagoOptions,
} from "../schemas/createMovimientoSchema";
import { useCreateMovimientoForm } from "../hooks/useCreateMovimientoForm.hook";
import { MovimientoFormField, SectionHeader } from "./forms/MovimientoFormField";
import { EnumSelect } from "./forms/EnumSelect";
import { SocioSelect } from "./forms/SocioSelect";
import { ClienteProveedorCombobox } from "./ClienteProveedorCombobox";
import { TitularSelect } from "./TitularSelect";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract the first error message from TanStack Form errors array. */
function getFieldError(errors: unknown[]): string | null {
  if (!errors || errors.length === 0) return null;
  const err = errors[0];
  if (!err) return null;
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

/** Convert a "yyyy-MM-dd" string to a Date for the DatePicker. */
function strToDate(value: string): Date | undefined {
  if (!value) return undefined;
  try {
    return parse(value, "yyyy-MM-dd", new Date());
  } catch {
    return undefined;
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

type MovimientoTipo = "INGRESO" | "EGRESO";

interface MovimientoCreateFormProps {
  tipo: MovimientoTipo;
  onSuccess?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MovimientoCreateForm({ tipo, onSuccess }: MovimientoCreateFormProps) {
  const { form, fieldErrors, clearFieldError } = useCreateMovimientoForm(tipo, onSuccess);
  const { data: socios = [] } = useSocios();
  const sociosActivos = useMemo(() => socios.filter((s) => s.activo), [socios]);

  return (
    <form
      id="create-movimiento-form"
      autoComplete="off"
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* ── Identificación ────────────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Identificación" />
        <div className="space-y-4">
          {/* Titular — full row */}
          <form.Field name="titular">
            {(field) => {
              const touchError =
                field.state.meta.isTouched && !field.state.meta.isValid
                  ? getFieldError(field.state.meta.errors)
                  : null;
              const error = fieldErrors.titular || touchError;
              return (
                <MovimientoFormField label="Titular" error={error} required>
                  <TitularSelect
                    value={field.state.value}
                    onChange={(v) => {
                      field.handleChange(v);
                      clearFieldError("titular");
                    }}
                  />
                </MovimientoFormField>
              );
            }}
          </form.Field>

          {/* Estado de cuenta + Monto */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="estadoCuenta">
              {(field) => {
                const touchError =
                  field.state.meta.isTouched && !field.state.meta.isValid
                    ? getFieldError(field.state.meta.errors)
                    : null;
                const error = fieldErrors.estadoCuenta || touchError;
                return (
                  <MovimientoFormField label="Estado de cuenta" error={error} required>
                    <Input
                      id="estadoCuenta"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        clearFieldError("estadoCuenta");
                      }}
                      aria-invalid={!!error}
                      className={cn(error && "border-destructive")}
                    />
                  </MovimientoFormField>
                );
              }}
            </form.Field>

            <form.Field name="monto">
              {(field) => {
                const touchError =
                  field.state.meta.isTouched && !field.state.meta.isValid
                    ? getFieldError(field.state.meta.errors)
                    : null;
                const error = fieldErrors.monto || touchError;
                return (
                  <MovimientoFormField label="Monto" error={error} required>
                    <CurrencyInput
                      id="monto"
                      value={field.state.value}
                      onChange={(val) => {
                        field.handleChange(val);
                        clearFieldError("monto");
                      }}
                      aria-invalid={!!error}
                      className={cn(error && "border-destructive")}
                    />
                  </MovimientoFormField>
                );
              }}
            </form.Field>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Operación ─────────────────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Operación" />
        <div className="space-y-4">
          {/* Fecha operación + Fecha corte */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="fechaOperacion">
              {(field) => {
                const touchError =
                  field.state.meta.isTouched && !field.state.meta.isValid
                    ? getFieldError(field.state.meta.errors)
                    : null;
                const error = fieldErrors.fechaOperacion || touchError;
                return (
                  <MovimientoFormField label="Fecha de operación" error={error} required>
                    <DatePicker
                      date={strToDate(field.state.value)}
                      onDateChange={(d) => {
                        field.handleChange(d ? format(d, "yyyy-MM-dd") : "");
                        clearFieldError("fechaOperacion");
                      }}
                    />
                  </MovimientoFormField>
                );
              }}
            </form.Field>

            <form.Field name="fechaCorte">
              {(field) => {
                const touchError =
                  field.state.meta.isTouched && !field.state.meta.isValid
                    ? getFieldError(field.state.meta.errors)
                    : null;
                const error = fieldErrors.fechaCorte || touchError;
                return (
                  <MovimientoFormField label="Fecha de corte" error={error} required>
                    <DatePicker
                      date={strToDate(field.state.value)}
                      onDateChange={(d) => {
                        field.handleChange(d ? format(d, "yyyy-MM-dd") : "");
                        clearFieldError("fechaCorte");
                      }}
                    />
                  </MovimientoFormField>
                );
              }}
            </form.Field>
          </div>

          {/* Forma de pago + Cargo / Abono */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="formaPago">
              {(field) => (
                <MovimientoFormField label="Forma de pago">
                  <EnumSelect
                    value={field.state.value ?? ""}
                    placeholder="Seleccioná una forma de pago"
                    options={movimientoFormaPagoOptions}
                    onChange={(v) => field.handleChange(v)}
                  />
                </MovimientoFormField>
              )}
            </form.Field>

            <form.Field name="cargoAbono">
              {(field) => (
                <MovimientoFormField label="Cargo / Abono">
                  <EnumSelect
                    value={field.state.value ?? ""}
                    placeholder="Seleccioná un origen"
                    options={movimientoCargoAbonoOptions}
                    onChange={(v) => field.handleChange(v)}
                  />
                </MovimientoFormField>
              )}
            </form.Field>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Descripción ───────────────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Descripción" />
        <div className="space-y-4">
          {/* Descripción literal — full row */}
          <form.Field name="descripcionLiteral">
            {(field) => {
              const touchError =
                field.state.meta.isTouched && !field.state.meta.isValid
                  ? getFieldError(field.state.meta.errors)
                  : null;
              const error = fieldErrors.descripcionLiteral || touchError;
              return (
                <MovimientoFormField label="Descripción literal" error={error} required>
                  <Textarea
                    id="descripcionLiteral"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearFieldError("descripcionLiteral");
                    }}
                    aria-invalid={!!error}
                    className={cn(error && "border-destructive")}
                    rows={3}
                  />
                </MovimientoFormField>
              );
            }}
          </form.Field>

          {/* Descripción administrativa — full row */}
          <form.Field name="descripcionAdministracion">
            {(field) => (
              <MovimientoFormField label="Descripción administrativa">
                <Textarea
                  id="descripcionAdministracion"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={2}
                />
              </MovimientoFormField>
            )}
          </form.Field>

          {/* Notas — full row */}
          <form.Field name="notas">
            {(field) => (
              <MovimientoFormField label="Notas">
                <Textarea
                  id="notas"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={2}
                />
              </MovimientoFormField>
            )}
          </form.Field>

          {/* Concepto + Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="concepto">
              {(field) => (
                <MovimientoFormField label="Concepto">
                  <Input
                    id="concepto"
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </MovimientoFormField>
              )}
            </form.Field>

            <form.Field name="categoria">
              {(field) => (
                <MovimientoFormField label="Categoría">
                  <EnumSelect
                    value={field.state.value ?? ""}
                    placeholder="Seleccioná una categoría"
                    options={movimientoCategoriaOptions}
                    onChange={(v) => field.handleChange(v)}
                  />
                </MovimientoFormField>
              )}
            </form.Field>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Contraparte ───────────────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Contraparte" />
        <div className="space-y-4">
          {tipo === "EGRESO" ? (
            /* Proveedor — full row */
            <form.Field name="proveedor">
              {(field) => (
                <div>
                  <ClienteProveedorCombobox
                    kind="proveedor"
                    label="Proveedor"
                    value={field.state.value ?? ""}
                    selectedId={null}
                    onChange={({ value, selectedId }) => {
                      field.handleChange(value);
                      form.setFieldValue("proveedorId", selectedId ?? "");
                    }}
                  />
                </div>
              )}
            </form.Field>
          ) : (
            /* Cliente — full row */
            <form.Field name="cliente">
              {(field) => (
                <div>
                  <ClienteProveedorCombobox
                    kind="cliente"
                    label="Cliente"
                    value={field.state.value ?? ""}
                    selectedId={null}
                    onChange={({ value, selectedId }) => {
                      field.handleChange(value);
                      form.setFieldValue("clienteId", selectedId ?? "");
                    }}
                  />
                </div>
              )}
            </form.Field>
          )}
        </div>
      </div>

      <Separator />

      {/* ── Aprobaciones ──────────────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Aprobaciones" />
        <div className="space-y-4">
          {/* Solicitado por + Autorizado por */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="solicitanteId">
              {(field) => (
                <MovimientoFormField label="Solicitado por">
                  <SocioSelect
                    value={field.state.value ?? ""}
                    options={sociosActivos}
                    onChange={(v) => field.handleChange(v)}
                  />
                </MovimientoFormField>
              )}
            </form.Field>

            <form.Field name="autorizadorId">
              {(field) => (
                <MovimientoFormField label="Autorizado por">
                  <SocioSelect
                    value={field.state.value ?? ""}
                    options={sociosActivos}
                    onChange={(v) => field.handleChange(v)}
                  />
                </MovimientoFormField>
              )}
            </form.Field>
          </div>

          {/* Facturado por */}
          <form.Field name="facturadoPor">
            {(field) => (
              <MovimientoFormField label="Facturado por">
                <EnumSelect
                  value={field.state.value ?? ""}
                  placeholder="Seleccioná quién factura"
                  options={movimientoFacturadoPorOptions}
                  onChange={(v) => field.handleChange(v)}
                />
              </MovimientoFormField>
            )}
          </form.Field>
        </div>
      </div>

      <Separator />

      {/* ── Referencias fiscales ──────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Referencias fiscales" />
        <div className="space-y-4">
          {/* Periodo + Número de factura */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="periodo">
              {(field) => (
                <MovimientoFormField label="Periodo">
                  <Input
                    id="periodo"
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </MovimientoFormField>
              )}
            </form.Field>

            <form.Field name="numeroFactura">
              {(field) => (
                <MovimientoFormField label="Nº de factura">
                  <Input
                    id="numeroFactura"
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </MovimientoFormField>
              )}
            </form.Field>
          </div>

          {/* Folio fiscal — full row */}
          <form.Field name="folioFiscal">
            {(field) => (
              <MovimientoFormField label="Folio fiscal">
                <Input
                  id="folioFiscal"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </MovimientoFormField>
            )}
          </form.Field>
        </div>
      </div>

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <Button type="submit" form="create-movimiento-form" className="w-full gap-2">
        <Plus className="size-4" />
        Crear movimiento
      </Button>
    </form>
  );
}
