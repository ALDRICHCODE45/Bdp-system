"use client";
import { useForm } from "@tanstack/react-form";
import { updateClienteProveedorSchemaUI } from "../schemas/updateClienteProveedorSchemaUI";
import { useEditClienteProveedor } from "./useEditClienteProveedor.hook";
import { ClienteProveedorDto } from "../server/dtos/ClienteProveedorDto.dto";

export const useEditClienteProveedorForm = (
  clienteProveedor: ClienteProveedorDto,
  onSuccess?: () => void
) => {
  const editClienteProveedorMutation = useEditClienteProveedor();

  const form = useForm({
    defaultValues: {
      id: clienteProveedor.id,
      nombre: clienteProveedor.nombre,
      rfc: clienteProveedor.rfc,
      tipo: clienteProveedor.tipo,
      direccion: clienteProveedor.direccion,
      telefono: clienteProveedor.telefono,
      email: clienteProveedor.email,
      contacto: clienteProveedor.contacto,
      numeroCuenta: clienteProveedor.numeroCuenta || "",
      clabe: clienteProveedor.clabe || "",
      banco: clienteProveedor.banco || "",
      activo: clienteProveedor.activo,
      fechaRegistro: new Date(clienteProveedor.fechaRegistro)
        .toISOString()
        .split("T")[0],
      notas: clienteProveedor.notas || "",
      socioId: clienteProveedor.socioResponsable?.id || "none",
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: updateClienteProveedorSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("id", value.id);
      formData.append("nombre", value.nombre);
      formData.append("rfc", value.rfc.toUpperCase());
      formData.append("tipo", value.tipo.toUpperCase()); // Convertir a mayúsculas para el servidor
      formData.append("direccion", value.direccion);
      formData.append("telefono", value.telefono);
      formData.append("email", value.email);
      formData.append("contacto", value.contacto);
      formData.append("numeroCuenta", value.numeroCuenta || "");
      formData.append("clabe", value.clabe || "");
      formData.append("banco", value.banco || "");
      formData.append("activo", String(value.activo));
      formData.append("fechaRegistro", value.fechaRegistro);
      formData.append("notas", value.notas || "");
      formData.append("socioId", value.socioId === "none" ? "" : value.socioId || "");

      await editClienteProveedorMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};
