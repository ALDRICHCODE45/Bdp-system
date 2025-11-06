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
import { useEditRoleForm } from "../../hooks/useEditRoleForm.hook";
import { getRoleAction } from "../../server/actions/getRoleAction";

interface EditRoleFormProps {
  roleId: string;
}

export const EditRoleForm = ({ roleId }: EditRoleFormProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["role", roleId],
    queryFn: async () => {
      const result = await getRoleAction(roleId);
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar rol");
      }
      return result.data;
    },
  });

  // Inicializar el hook con valores por defecto para cumplir las reglas de hooks
  const defaultRoleData = {
    id: "",
    name: "",
  };

  const form = useEditRoleForm(data || defaultRoleData);

  if (isLoading) {
    return (
      <div className="p-4">
        <p>Cargando datos del rol...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error al cargar rol: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <p>Rol no encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form
        id="edit-role-form"
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
                  <FieldLabel htmlFor={field.name}>Nombre del Rol</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Ej: Administrador"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </form>
      <Field orientation="horizontal" className="mt-3">
        <Button type="submit" form="edit-role-form" className="w-full">
          Actualizar rol
        </Button>
      </Field>
    </div>
  );
};

