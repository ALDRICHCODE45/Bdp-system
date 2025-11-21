"use client";

import React from "react";
import { Button } from "@/core/shared/ui/button";
import {
  FieldGroup,
  FieldLabel,
  Field,
  FieldError,
  FieldDescription,
} from "@/core/shared/ui/field";
import { Input } from "@/core/shared/ui/input";
import { useEmpresaForm } from "../../hooks/useEmpresaForm.hook";
import { EmpresaDto } from "../../server/dtos/EmpresaDto.dto";
import { Separator } from "@/core/shared/ui/separator";

interface EmpresaFormProps {
  empresa: EmpresaDto | null;
  onSuccess?: () => void;
}

export const EmpresaForm = ({ empresa, onSuccess }: EmpresaFormProps) => {
  const form = useEmpresaForm(empresa, onSuccess);

  return (
    <form
      id="empresa-form"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        {/* Datos Básicos */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Datos Básicos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Información general de la empresa
            </p>
          </div>

          <form.Field name="razonSocial">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Razón Social</FieldLabel>
                  <FieldDescription>
                    Nombre legal de la empresa
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Razón social de la empresa"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="nombreComercial">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Nombre Comercial</FieldLabel>
                  <FieldDescription>
                    Nombre comercial con el que se conoce la empresa
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Nombre comercial"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="rfc">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>RFC</FieldLabel>
                  <FieldDescription>
                    Registro Federal de Contribuyentes
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toUpperCase())
                    }
                    aria-invalid={isInvalid}
                    placeholder="ABC123456DEF"
                    autoComplete="off"
                    maxLength={13}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="curp">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>CURP</FieldLabel>
                  <FieldDescription>
                    Clave Única de Registro de Población (opcional)
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="CURP"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </div>

        <Separator />

        {/* Dirección Fiscal */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Dirección Fiscal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Dirección registrada para efectos fiscales
            </p>
          </div>

          <form.Field name="direccionFiscal">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Dirección</FieldLabel>
                  <FieldDescription>
                    Calle y número de la dirección fiscal
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Calle y número"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="colonia">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Colonia</FieldLabel>
                  <FieldDescription>
                    Colonia o delegación donde se ubica la empresa
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Colonia"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="ciudad">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Ciudad</FieldLabel>
                    <FieldDescription>
                      Ciudad donde se ubica la empresa
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Ciudad"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="estado">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Estado</FieldLabel>
                    <FieldDescription>
                      Estado o entidad federativa
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Estado"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="codigoPostal">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Código Postal</FieldLabel>
                    <FieldDescription>
                      Código postal de la dirección fiscal
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="00000"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="pais">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>País</FieldLabel>
                    <FieldDescription>
                      País donde se encuentra la empresa
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="México"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>
        </div>

        <Separator />

        {/* Datos Bancarios Principales */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Datos Bancarios Principales
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Información de la cuenta bancaria o tarjeta principal
            </p>
          </div>

          <form.Field name="bancoPrincipal">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Banco</FieldLabel>
                  <FieldDescription>
                    Nombre del banco de la cuenta principal
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
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

          <form.Field name="nombreEnTarjetaPrincipal">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Nombre en Tarjeta
                  </FieldLabel>
                  <FieldDescription>
                    Nombre que aparece en la tarjeta bancaria
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Nombre en tarjeta"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="numeroCuentaPrincipal">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Número de Cuenta
                  </FieldLabel>
                  <FieldDescription>
                    Número de cuenta bancaria o tarjeta
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
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

          <form.Field name="clabePrincipal">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>CLABE</FieldLabel>
                  <FieldDescription>
                    Clave Bancaria Estandarizada (18 dígitos)
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="fechaExpiracionPrincipal">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Fecha de Expiración
                    </FieldLabel>
                    <FieldDescription>
                      Fecha de expiración de la tarjeta (MM/AA)
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="cvvPrincipal">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>CVV</FieldLabel>
                    <FieldDescription>
                      Código de seguridad de la tarjeta (3-4 dígitos)
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="100"
                      max="9999"
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      aria-invalid={isInvalid}
                      placeholder="123"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>
        </div>

        <Separator />

        {/* Datos Bancarios Secundarios */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Datos Bancarios Secundarios
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Información de la cuenta bancaria o tarjeta secundaria (opcional)
            </p>
          </div>

          <form.Field name="bancoSecundario">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Banco</FieldLabel>
                  <FieldDescription>
                    Nombre del banco de la cuenta secundaria
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
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

          <form.Field name="nombreEnTarjetaSecundario">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Nombre en Tarjeta
                  </FieldLabel>
                  <FieldDescription>
                    Nombre que aparece en la tarjeta bancaria secundaria
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Nombre en tarjeta"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="numeroCuentaSecundario">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Número de Cuenta
                  </FieldLabel>
                  <FieldDescription>
                    Número de cuenta bancaria o tarjeta secundaria
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
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

          <form.Field name="clabeSecundaria">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>CLABE</FieldLabel>
                  <FieldDescription>
                    Clave Bancaria Estandarizada (18 dígitos)
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="fechaExpiracionSecundaria">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Fecha de Expiración
                    </FieldLabel>
                    <FieldDescription>
                      Fecha de expiración de la tarjeta secundaria (MM/AA)
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="cvvSecundario">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>CVV</FieldLabel>
                    <FieldDescription>
                      Código de seguridad de la tarjeta secundaria (3-4 dígitos)
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="100"
                      max="9999"
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      aria-invalid={isInvalid}
                      placeholder="123"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>
        </div>
      </FieldGroup>

      <Field orientation="horizontal" className="mt-6">
        <Button
          type="submit"
          form="empresa-form"
          className="w-full md:w-auto"
          disabled={form.state.isSubmitting}
        >
          {form.state.isSubmitting
            ? "Guardando..."
            : empresa
              ? "Actualizar Empresa"
              : "Crear Empresa"}
        </Button>
      </Field>
    </form>
  );
};

