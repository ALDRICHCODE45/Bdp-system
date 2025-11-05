"use client";

import { Button } from "@/core/shared/ui/button";
import {
  FieldGroup,
  FieldLabel,
  Field,
  FieldError,
} from "@/core/shared/ui/field";
import { Input } from "@/core/shared/ui/input";
import MultipleSelector from "@/core/shared/ui/multiselect";
import type { Option } from "@/core/shared/ui/multiselect";
import { useCreateUserForm } from "../../hooks/useCreateUserForm.hook";
import { rolesOptionsUI } from "../../types/forms/createUserForm/rolesOptions";

export const CreateUserForm = () => {
  const form = useCreateUserForm();

  return (
    <div className="p-4">
      <form
        id="create-user-form"
        // Deshabilita autocomplete a nivel de formulario, recomendación común para evitar guardar contraseñas en formularios fuera de login
        autoComplete="off"
        // Previene sugerencias para guardado de contraseñas
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
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
                    placeholder="usuario@ejemplo.com"
                    // Asegura que autocomplete esté apagado en cada input también
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="nombre">
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
                    placeholder="Nombre"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="*******"
                    // Previene el guardado de la contraseña por el navegador
                    autoComplete="new-password"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="roles">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const selectedOptions: Option[] = rolesOptionsUI.filter((opt) =>
                (field.state.value || []).includes(opt.value)
              );

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Roles</FieldLabel>
                  <MultipleSelector
                    commandProps={{
                      label: "Selecciona los roles",
                    }}
                    value={selectedOptions}
                    defaultOptions={rolesOptionsUI}
                    placeholder="Selecciona los roles"
                    onChange={(options) =>
                      field.handleChange(options.map((o) => o.value))
                    }
                    creatable={false}
                    hideClearAllButton
                    hidePlaceholderWhenSelected
                    emptyIndicator={
                      <p className="text-center text-sm">No results found</p>
                    }
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </form>
      <Field orientation="horizontal" className="mt-3">
        <Button type="submit" form="create-user-form" className="w-full">
          Crear usuario
        </Button>
      </Field>
    </div>
  );
};
