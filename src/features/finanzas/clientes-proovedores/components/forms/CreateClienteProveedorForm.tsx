"use client";

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
import { Checkbox } from "@/core/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { useCreateClienteProveedorForm } from "../../hooks/useCreateClienteProveedorForm.hook";
import { useSocios } from "@/features/RecursosHumanos/socios/hooks/useSocios.hook";
import { DatePicker } from "@/features/Recepcion/entradas-salidas/components/DatePicker";

interface CreateClienteProveedorFormProps {
  onSuccess?: () => void;
}

export const CreateClienteProveedorForm = ({
  onSuccess,
}: CreateClienteProveedorFormProps) => {
  const form = useCreateClienteProveedorForm(onSuccess);
  const { data: socios } = useSocios();

  return (
    <div className="p-4">
      <form
        id="create-cliente-proveedor-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          {/* Tipo */}
          <form.Field name="tipo">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
                    <FieldDescription>
                      Selecciona si es cliente o proveedor
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as "cliente" | "proveedor")
                    }
                  >
                    <SelectTrigger
                      id="tipo"
                      aria-invalid={isInvalid}
                      className="min-w-[120px]"
                    >
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="proveedor">Proveedor</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>

          {/* Nombre */}
          <form.Field name="nombre">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Nombre o Razón Social
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Nombre completo o razón social"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* RFC */}
          <form.Field name="rfc">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>RFC</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toUpperCase())
                    }
                    aria-invalid={isInvalid}
                    placeholder="ABC123456XYZ"
                    autoComplete="off"
                    maxLength={13}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Email */}
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="email@ejemplo.com"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Teléfono */}
          <form.Field name="telefono">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="tel"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="+52 55 1234 5678"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Contacto */}
          <form.Field name="contacto">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Persona de Contacto
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Nombre del contacto principal"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Dirección */}
          <form.Field name="direccion">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Dirección</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Dirección completa"
                    rows={2}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Banco */}
          <form.Field name="banco">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Banco (Opcional)</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="BBVA, Santander, etc."
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Número de Cuenta */}
          <form.Field name="numeroCuenta">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Número de Cuenta (Opcional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="1234567890"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* CLABE */}
          <form.Field name="clabe">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>CLABE (Opcional)</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="18 dígitos"
                    autoComplete="off"
                    maxLength={18}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Socio Responsable */}
          <form.Field name="socioId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="socioId">
                      Socio Responsable (Opcional)
                    </FieldLabel>
                    <FieldDescription>
                      Socio encargado de este cliente/proveedor
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger
                      id="socioId"
                      aria-invalid={isInvalid}
                      className="min-w-[120px]"
                    >
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {socios?.map((socio) => (
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

          {/* Fecha de Registro */}
          <form.Field name="fechaRegistro">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              // Convertir string ISO a Date para el DatePicker
              const selectedDate = field.state.value
                ? new Date(field.state.value)
                : new Date();

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Fecha de Registro
                  </FieldLabel>
                  <DatePicker
                    date={selectedDate}
                    onDateChange={(date) => {
                      // Convertir Date a string ISO para el formulario
                      const isoString = date
                        ? date.toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0];
                      field.handleChange(isoString);
                    }}
                    placeholder="Selecciona la fecha de registro"
                    className="w-full"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Activo */}
          <form.Field name="activo">
            {(field) => {
              const isActivo = !!field.state.value;
              return (
                <Field>
                  <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
                    <Checkbox
                      id={field.name}
                      className="order-1 after:absolute after:inset-0"
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked as boolean)
                      }
                      aria-describedby={`${field.name}-description`}
                    />
                    <div className="grid grow gap-2">
                      <FieldLabel
                        htmlFor={field.name}
                        className="cursor-pointer"
                      >
                        {isActivo ? "Activo" : "Inactivo"}
                      </FieldLabel>
                      <p
                        id={`${field.name}-description`}
                        className="text-xs text-muted-foreground"
                      >
                        {isActivo
                          ? "El cliente/proveedor está activo"
                          : "El cliente/proveedor está inactivo"}
                      </p>
                    </div>
                  </div>
                </Field>
              );
            }}
          </form.Field>

          {/* Notas */}
          <form.Field name="notas">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Notas (Opcional)</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Notas adicionales"
                    rows={3}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </form>
      <Field orientation="horizontal" className="mt-3">
        <Button
          type="submit"
          form="create-cliente-proveedor-form"
          className="w-full"
        >
          Crear Cliente/Proveedor
        </Button>
      </Field>
    </div>
  );
};
