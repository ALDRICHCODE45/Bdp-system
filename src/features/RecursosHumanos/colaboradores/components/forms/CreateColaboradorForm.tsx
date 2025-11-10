"use client";

import React from "react";
import { Button } from "@/core/shared/ui/button";
import {
  FieldGroup,
  FieldLabel,
  Field,
  FieldError,
} from "@/core/shared/ui/field";
import { Input } from "@/core/shared/ui/input";
import { Checkbox } from "@/core/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { useCreateColaboradorForm } from "../../hooks/useCreateColaboradorForm.hook";
import { useSocios } from "@/features/RecursosHumanos/socios/hooks/useSocios.hook";
import { ColaboradorEstado } from "../../types/ColaboradorEstado.enum";
import { Tag, TagInput } from "emblor";
import { useState } from "react";

interface CreateColaboradorFormProps {
  onSuccess?: () => void;
}

export const CreateColaboradorForm = ({
  onSuccess,
}: CreateColaboradorFormProps) => {
  const form = useCreateColaboradorForm(onSuccess);
  const { data: socios, isLoading: isLoadingSocios } = useSocios();
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  return (
    <div className="p-4">
      <form
        id="create-colaborador-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Nombre completo"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="correo">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Correo</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="colaborador@ejemplo.com"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="puesto">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Puesto</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Desarrollador, Gerente, etc."
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="status">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Estado</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as ColaboradorEstado)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ColaboradorEstado.CONTRATADO}>
                        Contratado
                      </SelectItem>
                      <SelectItem value={ColaboradorEstado.DESPEDIDO}>
                        Despedido
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="socioId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              if (isLoadingSocios) {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Socio Responsable
                    </FieldLabel>
                    <div className="text-sm text-muted-foreground">
                      Cargando socios...
                    </div>
                  </Field>
                );
              }

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Socio Responsable (Opcional)
                  </FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin socio asignado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Sin asignar</SelectItem>
                      {socios?.map((socio) => (
                        <SelectItem key={socio.id} value={socio.id}>
                          {socio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="banco">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Banco</FieldLabel>
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

          <form.Field name="clabe">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>CLABE</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="18 dígitos"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="sueldo">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Sueldo</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    step="0.01"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="15000.00"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="activos">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              // Convertir string[] a Tag[]
              const activosArray = field.state.value || [];
              const tags = activosArray.map((text, index) => ({
                id: `tag-${index}-${text}`,
                text: text,
              }));

              // Convertir Tag[] a string[] y actualizar el formulario
              const handleTagsChange = (
                newTags: React.SetStateAction<Tag[]>
              ) => {
                // Obtener el valor actual del campo y convertirlo a Tag[] para la función de actualización
                const currentActivos = field.state.value || [];
                const currentTags = currentActivos.map((text, index) => ({
                  id: `tag-${index}-${text}`,
                  text: text,
                }));

                // Aplicar la actualización (puede ser un valor directo o una función)
                const tagsArray =
                  typeof newTags === "function"
                    ? newTags(currentTags)
                    : newTags;

                // Convertir Tag[] a string[] y actualizar el formulario
                const activosArray = tagsArray.map((tag) => tag.text);
                field.handleChange(activosArray);
              };

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Activos</FieldLabel>
                  <TagInput
                    placeholder="Ingresa un activo y presiona Enter"
                    tags={tags}
                    setTags={handleTagsChange}
                    activeTagIndex={activeTagIndex}
                    setActiveTagIndex={setActiveTagIndex}
                    onBlur={field.handleBlur}
                    id={field.name}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="imss">
            {(field) => {
              const hasIMSS = !!field.state.value;
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
                        {hasIMSS ? "Con IMSS" : "Sin IMSS"}
                      </FieldLabel>
                      <p
                        id={`${field.name}-description`}
                        className="text-xs text-muted-foreground"
                      >
                        {hasIMSS
                          ? "El colaborador está dado de alta en el IMSS"
                          : "El colaborador no tiene IMSS"}
                      </p>
                    </div>
                  </div>
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </form>
      <Field orientation="horizontal" className="mt-3">
        <Button type="submit" form="create-colaborador-form" className="w-full">
          Crear Colaborador
        </Button>
      </Field>
    </div>
  );
};
