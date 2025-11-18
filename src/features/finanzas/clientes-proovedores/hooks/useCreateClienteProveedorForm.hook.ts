"use client";
import { useForm } from "@tanstack/react-form";
import { createClienteProveedorSchemaUI } from "../schemas/createClienteProveedorSchemaUI";
import { useCreateClienteProveedor } from "./useCreateClienteProveedor.hook";

export const useCreateClienteProveedorForm = (onSuccess?: () => void) => {
  const createClienteProveedorMutation = useCreateClienteProveedor();

  const form = useForm({
    defaultValues: {
      nombre: "",
      rfc: "",
      tipo: "cliente" as "cliente" | "proveedor",
      direccion: "",
      telefono: "",
      email: "",
      contacto: "",
      numeroCuenta: "",
      clabe: "",
      banco: "",
      activo: true,
      fechaRegistro: new Date().toISOString().split("T")[0],
      notas: "",
      socioId: "none",
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: createClienteProveedorSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
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

      await createClienteProveedorMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};
