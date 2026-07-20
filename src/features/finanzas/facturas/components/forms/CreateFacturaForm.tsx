"use client";

import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import {
  FieldGroup,
  FieldSeparator,
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/core/shared/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Combobox } from "@/core/shared/ui/combobox";
import { DatePicker } from "@/core/shared/ui/date-picker";
import { format, parse } from "date-fns";
import { Plus } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { useCreateFacturaForm } from "../../hooks/useCreateFacturaForm.hook";
import { useStore } from "@tanstack/react-form";
import { FacturaSATUpload } from "../FacturaSATUpload";
import { CurrencyInput } from "@/core/shared/components/CurrencyInput";

// ─── USO CFDI options ─────────────────────────────────────────────────────────
const USO_CFDI_OPTIONS = [
  { value: "N/A",  label: "N/A — No aplica" },
  { value: "G01",  label: "G01 — Adquisición de mercancias" },
  { value: "G02",  label: "G02 — Devoluciones, descuentos o bonificaciones" },
  { value: "G03",  label: "G03 — Gastos en general" },
  { value: "I01",  label: "I01 — Construcciones" },
  { value: "I02",  label: "I02 — Mobiliario y equipo de oficina" },
  { value: "I03",  label: "I03 — Equipo de transporte" },
  { value: "I04",  label: "I04 — Equipo de cómputo y accesorios" },
  { value: "I05",  label: "I05 — Dados, troqueles, moldes, matrices y herramental" },
  { value: "I06",  label: "I06 — Comunicaciones telefónicas" },
  { value: "I07",  label: "I07 — Comunicaciones satelitales" },
  { value: "I08",  label: "I08 — Otra maquinaria y equipo" },
  { value: "D01",  label: "D01 — Honorarios médicos, dentales y gastos hospitalarios" },
  { value: "D02",  label: "D02 — Gastos médicos por incapacidad o discapacidad" },
  { value: "D03",  label: "D03 — Gastos funerales" },
  { value: "D04",  label: "D04 — Donativos" },
  { value: "D05",  label: "D05 — Intereses reales por créditos hipotecarios (casa habitación)" },
  { value: "D06",  label: "D06 — Aportaciones voluntarias al SAR" },
  { value: "D07",  label: "D07 — Primas por seguros de gastos médicos" },
  { value: "D08",  label: "D08 — Gastos de transportación escolar obligatoria" },
  { value: "D09",  label: "D09 — Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones" },
  { value: "D10",  label: "D10 — Pagos por servicios educativos (colegiaturas)" },
  { value: "CP01", label: "CP01 — Pagos" },
  { value: "S01",  label: "S01 — Sin efectos fiscales" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateFacturaFormProps {
  onSuccess?: () => void;
  isCapturador?: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const CreateFacturaForm = ({
  onSuccess,
  isCapturador = false,
}: CreateFacturaFormProps) => {
  const form = useCreateFacturaForm(onSuccess);

  // Leer valores reactivos para auto-calcular Total
  const subtotal = useStore(form.store, (s) => s.values.subtotal);
  const iva = useStore(form.store, (s) => s.values.iva);
  const trasladados = useStore(form.store, (s) => s.values.totalImpuestosTransladados);
  const retenidos = useStore(form.store, (s) => s.values.totalImpuestosRetenidos);

  // Auto-calcular total cada vez que cambia cualquier monto
  const calcularTotal = (
    sub: number,
    ivaVal: number,
    tras: number,
    ret: number,
  ) => {
    const total = (sub || 0) + (ivaVal || 0) + (tras || 0) - (ret || 0);
    return Math.round(total * 100) / 100;
  };

  return (
    <div className="p-4">
      <form
        id="create-factura-form"
        autoComplete="off"
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit();
        }}
      >
        <FieldGroup>
          {/* ── Datos fiscales ─────────────────────────────────────────── */}
          <FieldSeparator>Datos fiscales</FieldSeparator>
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="rfcEmisor">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="rfcEmisor">RFC Emisor</FieldLabel>
                    <Input
                      id="rfcEmisor"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      aria-invalid={isInvalid}
                      maxLength={13}
                      className={cn("font-mono uppercase", isInvalid && "border-destructive")}
                    />
                    <FieldDescription>12–13 caracteres</FieldDescription>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="nombreEmisor">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="nombreEmisor">
                    Nombre Emisor (Opcional)
                  </FieldLabel>
                  <Input
                    id="nombreEmisor"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="rfcReceptor">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="rfcReceptor">RFC Receptor</FieldLabel>
                    <Input
                      id="rfcReceptor"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      aria-invalid={isInvalid}
                      maxLength={13}
                      className={cn("font-mono uppercase", isInvalid && "border-destructive")}
                    />
                    <FieldDescription>12–13 caracteres</FieldDescription>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="nombreReceptor">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="nombreReceptor">
                    Nombre Receptor (Opcional)
                  </FieldLabel>
                  <Input
                    id="nombreReceptor"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>
          </div>

          {/* ── Identificación ─────────────────────────────────────────── */}
          <FieldSeparator>Identificación</FieldSeparator>
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="uuid">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="md:col-span-2">
                    <FieldLabel htmlFor="uuid">UUID</FieldLabel>
                    <Input
                      id="uuid"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className={cn(
                        "font-mono",
                        isInvalid && "border-destructive focus-visible:ring-destructive",
                      )}
                      placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                      spellCheck={false}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="concepto">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="md:col-span-2">
                    <FieldLabel htmlFor="concepto">Concepto</FieldLabel>
                    <Input
                      id="concepto"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className={cn(
                        isInvalid && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="serie">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="serie">Serie (Opcional)</FieldLabel>
                  <Input
                    id="serie"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="A"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="folio">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="folio">Folio (Opcional)</FieldLabel>
                  <Input
                    id="folio"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="001"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="usoCfdi">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="usoCfdi">Uso CFDI (Opcional)</FieldLabel>
                  <Combobox
                    id="usoCfdi"
                    options={USO_CFDI_OPTIONS}
                    value={field.state.value ?? ""}
                    onChange={(v) => field.handleChange(v)}
                    placeholder="Seleccionar uso CFDI"
                    searchPlaceholder="Buscar uso CFDI..."
                    emptyMessage="Sin coincidencias."
                    clearable
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="moneda">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="moneda">Moneda</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v)}
                    >
                      <SelectTrigger id="moneda" aria-invalid={isInvalid}>
                        <SelectValue placeholder="Moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MXN">MXN — Peso mexicano</SelectItem>
                        <SelectItem value="USD">USD — Dólar</SelectItem>
                        <SelectItem value="EUR">EUR — Euro</SelectItem>
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          {/* ── Montos ─────────────────────────────────────────────────── */}
          <FieldSeparator>Montos</FieldSeparator>
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="subtotal">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="subtotal">Subtotal</FieldLabel>
                    <CurrencyInput
                      id="subtotal"
                      name={field.name}
                      value={field.state.value}
                      onChange={(val) => {
                        field.handleChange(val);
                        form.setFieldValue("total", calcularTotal(val, iva ?? 0, trasladados ?? 0, retenidos ?? 0));
                      }}
                      aria-invalid={isInvalid}
                      className={cn(isInvalid && "border-destructive")}
                    />
                    <FieldDescription>Antes de impuestos</FieldDescription>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="iva">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="iva">IVA (Opcional)</FieldLabel>
                  <CurrencyInput
                    id="iva"
                    name={field.name}
                    value={field.state.value ?? 0}
                    onChange={(val) => {
                      field.handleChange(val);
                      form.setFieldValue("total", calcularTotal(subtotal ?? 0, val, trasladados ?? 0, retenidos ?? 0));
                    }}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="totalImpuestosTransladados">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="totalImpuestosTransladados">
                    Imp. Trasladados (Opcional)
                  </FieldLabel>
                  <CurrencyInput
                    id="totalImpuestosTransladados"
                    name={field.name}
                    value={field.state.value ?? 0}
                    onChange={(val) => {
                      field.handleChange(val);
                      form.setFieldValue("total", calcularTotal(subtotal ?? 0, iva ?? 0, val, retenidos ?? 0));
                    }}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="totalImpuestosRetenidos">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="totalImpuestosRetenidos">
                    Imp. Retenidos (Opcional)
                  </FieldLabel>
                  <CurrencyInput
                    id="totalImpuestosRetenidos"
                    name={field.name}
                    value={field.state.value ?? 0}
                    onChange={(val) => {
                      field.handleChange(val);
                      form.setFieldValue("total", calcularTotal(subtotal ?? 0, iva ?? 0, trasladados ?? 0, val));
                    }}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="total">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="md:col-span-2">
                    <FieldLabel htmlFor="total">Total</FieldLabel>
                    <CurrencyInput
                      id="total"
                      name={field.name}
                      value={field.state.value}
                      onChange={() => {}}
                      readOnly
                      aria-invalid={isInvalid}
                      className={cn(isInvalid && "border-destructive")}
                    />
                    <FieldDescription>Calculado automáticamente</FieldDescription>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          {/* ── Status y pago ──────────────────────────────────────────── */}
          {!isCapturador && (
            <>
              <FieldSeparator>Status y pago</FieldSeparator>
              <div className="grid gap-4 md:grid-cols-2">
                <form.Field name="status">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="status">Status</FieldLabel>
                        <Select
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(v) =>
                            field.handleChange(v as "vigente" | "cancelada")
                          }
                        >
                          <SelectTrigger id="status" aria-invalid={isInvalid}>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vigente">Vigente</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="metodoPago">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="metodoPago">Forma de Pago</FieldLabel>
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
                          <SelectItem value="PPD">PPD — Pago en parcialidades o diferido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>PUE / PPD</FieldDescription>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="medioPago">
                  {(field) => (
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor="medioPago">Método de Pago</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v)}
                      >
                        <SelectTrigger id="medioPago">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                          <SelectItem value="Depósito">Depósito</SelectItem>
                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="statusPago">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="statusPago">Status de Pago</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v)}
                      >
                        <SelectTrigger id="statusPago">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pagado">Pagado</SelectItem>
                          <SelectItem value="Pendiente de pago">Pendiente de pago</SelectItem>
                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="fechaPago">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="fechaPago">Fecha de Pago (Opcional)</FieldLabel>
                      <DatePicker
                        date={
                          field.state.value
                            ? parse(field.state.value, "yyyy-MM-dd", new Date())
                            : undefined
                        }
                        onDateChange={(date) => {
                          field.handleChange(date ? format(date, "yyyy-MM-dd") : "");
                        }}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="fechaEmision">
                  {(field) => (
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor="fechaEmision">Fecha de Emisión (Opcional)</FieldLabel>
                      <DatePicker
                        date={
                          field.state.value
                            ? parse(field.state.value, "yyyy-MM-dd", new Date())
                            : undefined
                        }
                        onDateChange={(date) => {
                          field.handleChange(date ? format(date, "yyyy-MM-dd") : "");
                        }}
                      />
                      <FieldDescription>Fecha en que fue emitida la factura</FieldDescription>
                    </Field>
                  )}
                </form.Field>
              </div>
            </>
          )}

          {/* ── Factura SAT — oculta para capturador ─────────────────────── */}
          {!isCapturador && (
            <>
              <FieldSeparator>Factura SAT</FieldSeparator>
              <form.Field name="facturaUrl">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="facturaUrl">PDF timbrado (Opcional)</FieldLabel>
                    <FacturaSATUpload
                      value={field.state.value}
                      onChange={(url) => field.handleChange(url)}
                      onClear={() => field.handleChange("")}
                    />
                    <FieldDescription>Subí el PDF de la factura timbrada por el SAT</FieldDescription>
                  </Field>
                )}
              </form.Field>
            </>
          )}
        </FieldGroup>
      </form>

      <Field orientation="horizontal" className="mt-3">
        <Button type="submit" form="create-factura-form" className="w-full gap-2">
          <Plus className="size-4" />
          Crear factura
        </Button>
      </Field>
    </div>
  );
};
