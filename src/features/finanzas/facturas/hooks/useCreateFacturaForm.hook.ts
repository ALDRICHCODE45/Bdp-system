"use client";
import { useForm } from "@tanstack/react-form";
import { createFacturaSchemaUI } from "../schemas/createFacturaSchemaUI";
import { useCreateFactura } from "./useCreateFactura.hook";

export const useCreateFacturaForm = (onSuccess?: () => void) => {
  const createFacturaMutation = useCreateFactura();

  const form = useForm({
    defaultValues: {
      tipoOrigen: "ingreso" as "ingreso" | "egreso",
      origenId: "",
      clienteProveedorId: "",
      clienteProveedor: "",
      concepto: "",
      monto: 0,
      periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
      numeroFactura: "",
      folioFiscal: "",
      fechaEmision: new Date().toISOString().split("T")[0],
      fechaVencimiento: new Date().toISOString().split("T")[0],
      estado: "borrador" as "borrador" | "enviada" | "pagada" | "cancelada",
      formaPago: "transferencia" as "transferencia" | "efectivo" | "cheque",
      rfcEmisor: "",
      rfcReceptor: "",
      direccionEmisor: "",
      direccionReceptor: "",
      numeroCuenta: "",
      clabe: "",
      banco: "",
      fechaPago: "",
      fechaRegistro: new Date().toISOString().split("T")[0],
      creadoPor: "",
      creadoPorId: "",
      autorizadoPor: "",
      autorizadoPorId: "",
      notas: "",
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: createFacturaSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("tipoOrigen", value.tipoOrigen.toUpperCase());
      formData.append("origenId", value.origenId);
      formData.append("clienteProveedorId", value.clienteProveedorId);
      formData.append("clienteProveedor", value.clienteProveedor);
      formData.append("concepto", value.concepto);
      formData.append("monto", String(value.monto));
      formData.append("periodo", value.periodo);
      formData.append("numeroFactura", value.numeroFactura);
      formData.append("folioFiscal", value.folioFiscal);
      formData.append("fechaEmision", value.fechaEmision);
      formData.append("fechaVencimiento", value.fechaVencimiento);
      formData.append("estado", value.estado.toUpperCase());
      formData.append("formaPago", value.formaPago.toUpperCase());
      formData.append("rfcEmisor", value.rfcEmisor);
      formData.append("rfcReceptor", value.rfcReceptor);
      formData.append("direccionEmisor", value.direccionEmisor);
      formData.append("direccionReceptor", value.direccionReceptor);
      formData.append("numeroCuenta", value.numeroCuenta);
      formData.append("clabe", value.clabe);
      formData.append("banco", value.banco);
      formData.append("fechaPago", value.fechaPago || "");
      formData.append("fechaRegistro", value.fechaRegistro);
      formData.append("creadoPor", value.creadoPor);
      formData.append("creadoPorId", value.creadoPorId);
      formData.append("autorizadoPor", value.autorizadoPor);
      formData.append("autorizadoPorId", value.autorizadoPorId);
      formData.append("notas", value.notas || "");

      await createFacturaMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

