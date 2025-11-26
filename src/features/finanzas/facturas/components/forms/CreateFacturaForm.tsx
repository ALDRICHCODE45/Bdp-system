"use client";

import { useState } from "react";
import { Button } from "@/core/shared/ui/button";
import {
  FieldGroup,
  FieldLabel,
  Field,
  FieldError,
  FieldContent,
  FieldDescription,
} from "@/core/shared/ui/field";
import { Input } from "@/core/shared/ui/input";
import { Textarea } from "@/core/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { useCreateFacturaForm } from "../../hooks/useCreateFacturaForm.hook";
import { useSocios } from "@/features/RecursosHumanos/socios/hooks/useSocios.hook";
import { DatePicker } from "@/features/Recepcion/entradas-salidas/components/DatePicker";
import { useOrigenData } from "../../hooks/useOrigenData.hook";
import { toast } from "sonner";

interface CreateFacturaFormProps {
  onSuccess?: () => void;
}

export const CreateFacturaForm = ({ onSuccess }: CreateFacturaFormProps) => {
  const form = useCreateFacturaForm(onSuccess);
  const { data: socios } = useSocios();
  const sociosActivos = socios?.filter((s) => s.activo) || [];
  const [tipoOrigenLocal, setTipoOrigenLocal] = useState<"INGRESO" | "EGRESO">(
    "INGRESO"
  );
  const [origenIdLocal, setOrigenIdLocal] = useState("");
  const [shouldLoadOrigen, setShouldLoadOrigen] = useState(false);

  const { data: origenData, isLoading: isLoadingOrigen } = useOrigenData(
    tipoOrigenLocal,
    origenIdLocal,
    shouldLoadOrigen
  );

  const handleLoadOrigenData = () => {
    if (!origenIdLocal.trim()) {
      toast.error("Ingresa un ID de origen válido");
      return;
    }
    setShouldLoadOrigen(true);
  };

  // Auto-completar cuando se carguen los datos del origen
  if (origenData && shouldLoadOrigen) {
    form.setFieldValue("clienteProveedorId", origenData.clienteProveedorId);
    form.setFieldValue("clienteProveedor", origenData.clienteProveedor);
    form.setFieldValue("concepto", origenData.concepto);
    form.setFieldValue("monto", origenData.monto);
    form.setFieldValue("periodo", origenData.periodo);
    form.setFieldValue("numeroFactura", origenData.numeroFactura);
    form.setFieldValue("folioFiscal", origenData.folioFiscal);
    form.setFieldValue(
      "formaPago",
      origenData.formaPago.toLowerCase() as
        | "transferencia"
        | "efectivo"
        | "cheque"
    );
    form.setFieldValue("rfcReceptor", origenData.rfcReceptor);
    form.setFieldValue("direccionReceptor", origenData.direccionReceptor);
    form.setFieldValue("numeroCuenta", origenData.numeroCuenta);
    form.setFieldValue("clabe", origenData.clabe);
    form.setFieldValue("banco", origenData.banco);
    if (origenData.notas) {
      form.setFieldValue("notas", origenData.notas);
    }
    setShouldLoadOrigen(false);
    toast.success("Datos cargados exitosamente");
  }

  return (
    <div className="p-4">
      <form
        id="create-factura-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          {/* Tipo de Origen */}
          <form.Field name="tipoOrigen">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="tipoOrigen">Tipo de Origen</FieldLabel>
                    <FieldDescription>Selecciona el tipo</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value as "ingreso" | "egreso");
                      setTipoOrigenLocal(
                        value.toUpperCase() as "INGRESO" | "EGRESO"
                      );
                    }}
                  >
                    <SelectTrigger id="tipoOrigen" aria-invalid={isInvalid}>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="ingreso">Ingreso</SelectItem>
                      <SelectItem value="egreso">Egreso</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>

          {/* ID del Origen con botón de carga */}
          <form.Field name="origenId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="origenId">ID del Origen</FieldLabel>
                    <FieldDescription>
                      Ingresa el ID del ingreso o egreso
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <div className="flex gap-2">
                    <Input
                      id="origenId"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        setOrigenIdLocal(e.target.value);
                      }}
                      aria-invalid={isInvalid}
                      placeholder="UUID del origen"
                    />
                    <Button
                      type="button"
                      onClick={handleLoadOrigenData}
                      disabled={isLoadingOrigen}
                      variant="outline"
                    >
                      {isLoadingOrigen ? "Cargando..." : "Cargar"}
                    </Button>
                  </div>
                </Field>
              );
            }}
          </form.Field>

          {/* Cliente/Proveedor (autocompletado) */}
          <form.Field name="clienteProveedor">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="clienteProveedor">
                      Cliente/Proveedor
                    </FieldLabel>
                    <FieldDescription>Nombre autocompletado</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="clienteProveedor"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    readOnly
                    className="bg-muted"
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* clienteProveedorId (hidden pero necesario) */}
          <form.Field name="clienteProveedorId">
            {(field) => (
              <input
                type="hidden"
                name={field.name}
                value={field.state.value}
              />
            )}
          </form.Field>

          {/* Resto de campos autocompletados */}
          <form.Field name="concepto">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="concepto">Concepto</FieldLabel>
                    <FieldDescription>Autocompletado</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="concepto"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="monto">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="monto">Monto</FieldLabel>
                    <FieldDescription>Autocompletado</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="monto"
                    name={field.name}
                    type="number"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value) || 0)
                    }
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Campos específicos de factura (manuales) */}
          <form.Field name="fechaEmision">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="fechaEmision">
                      Fecha de Emisión
                    </FieldLabel>
                    <FieldDescription>Selecciona la fecha</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
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
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="fechaVencimiento">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="fechaVencimiento">
                      Fecha de Vencimiento
                    </FieldLabel>
                    <FieldDescription>Selecciona la fecha</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
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
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="rfcEmisor">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="rfcEmisor">RFC Emisor</FieldLabel>
                    <FieldDescription>12-13 caracteres</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="rfcEmisor"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    maxLength={13}
                  />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="direccionEmisor">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="direccionEmisor">
                      Dirección Emisor
                    </FieldLabel>
                    <FieldDescription>Dirección completa</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Textarea
                    id="direccionEmisor"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Número de Cuenta (autocompletado) */}
          <form.Field name="numeroCuenta">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="numeroCuenta">Número de Cuenta</FieldLabel>
                    <FieldDescription>Autocompletado desde origen</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="numeroCuenta"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    readOnly
                    className="bg-muted"
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* CLABE (autocompletado) */}
          <form.Field name="clabe">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="clabe">CLABE</FieldLabel>
                    <FieldDescription>Autocompletado desde origen</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="clabe"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    maxLength={18}
                    readOnly
                    className="bg-muted"
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Banco (autocompletado) */}
          <form.Field name="banco">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="banco">Banco</FieldLabel>
                    <FieldDescription>Autocompletado desde origen</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="banco"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    readOnly
                    className="bg-muted"
                  />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="creadoPorId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="creadoPorId">Creado Por</FieldLabel>
                    <FieldDescription>Selecciona el socio creador</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value);
                      const socio = sociosActivos.find((s) => s.id === value);
                      if (socio) {
                        form.setFieldValue("creadoPor", socio.nombre);
                      }
                    }}
                  >
                    <SelectTrigger id="creadoPorId" aria-invalid={isInvalid}>
                      <SelectValue placeholder="Seleccionar socio" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {sociosActivos.map((socio) => (
                        <SelectItem key={socio.id} value={socio.id}>
                          {socio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="autorizadoPorId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="autorizadoPorId">
                      Autorizado Por
                    </FieldLabel>
                    <FieldDescription>Selecciona el socio autorizador</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value);
                      const socio = sociosActivos.find((s) => s.id === value);
                      if (socio) {
                        form.setFieldValue("autorizadoPor", socio.nombre);
                      }
                    }}
                  >
                    <SelectTrigger id="autorizadoPorId" aria-invalid={isInvalid}>
                      <SelectValue placeholder="Seleccionar socio" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {sociosActivos.map((socio) => (
                        <SelectItem key={socio.id} value={socio.id}>
                          {socio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <Button type="submit" className="w-full" form="create-factura-form">
              Crear Factura
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};
