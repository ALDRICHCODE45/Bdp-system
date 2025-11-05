"use client";

import { useQuery } from "@tanstack/react-query";
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
import { useEditUserForm } from "../../hooks/useEditUserForm.hook";
import { rolesOptionsUI } from "../../types/forms/createUserForm/rolesOptions";
import { getUserAction } from "../../server/actions/getUserAction";
import { Checkbox } from "@/core/shared/ui/checkbox";

interface EditUserFormProps {
  userId: string;
}

export const EditUserForm = ({ userId }: EditUserFormProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const result = await getUserAction(userId);
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar usuario");
      }
      return result.data;
    },
  });

  // Inicializar el hook con valores por defecto para cumplir las reglas de hooks
  const defaultUserData = {
    id: "",
    email: "",
    name: "",
    roles: [] as string[],
    isActive: false,
  };

  const form = useEditUserForm(data || defaultUserData);

  if (isLoading) {
    return (
      <div className="p-4">
        <p>Cargando datos del usuario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error al cargar usuario: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <p>Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form
        id="edit-user-form"
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
                  <FieldLabel htmlFor={field.name}>Nueva Contraseña</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="*******"
                    autoComplete="off"
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

          <form.Field name="isActive">
            {(field) => {
              const isUserActive = !!field.state.value;
              // Aquí conectamos el checkbox como un controlled component basado en field.state.value (que es true o false)
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
                        Usuario {isUserActive ? "Activo" : "Inactivo"}
                      </FieldLabel>
                      <p
                        id={`${field.name}-description`}
                        className="text-xs text-muted-foreground"
                      >
                        {isUserActive
                          ? "El usuario puede acceder al sistema"
                          : "El usuario no puede accedar al sistema"}
                      </p>
                    </div>
                  </div>

                  {field.state.meta.errors.length > 0 && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </form>
      <Field orientation="horizontal" className="mt-3">
        <Button type="submit" form="edit-user-form" className="w-full">
          Actualizar usuario
        </Button>
      </Field>
    </div>
  );
};
