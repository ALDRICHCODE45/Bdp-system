"use client";
import { useForm } from "@tanstack/react-form";
import { createIngresoSchemaUI } from "../schemas/createIngresoSchemaUI";
import { useCreateIngreso } from "./useCreateIngreso.hook";

export const useCreateIngresoForm = (onSuccess?: () => void) => {
  const createIngresoMutation = useCreateIngreso();

  const form = useForm({
    defaultValues: {
      concepto: "",
      cliente: "",
      clienteId: "",
      solicitante: "rjs" as "rjs" | "rgz" | "calfc",
      autorizador: "rjs" as "rjs" | "rgz" | "calfc",
      numeroFactura: "",
      folioFiscal: "",
      periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
      formaPago: "transferencia" as "transferencia" | "efectivo" | "cheque",
      origen: "",
      numeroCuenta: "",
      clabe: "",
      cargoAbono: "bdp" as "bdp" | "calfc",
      cantidad: 0,
      estado: "pendiente" as "pagado" | "pendiente" | "cancelado",
      fechaPago: "",
      fechaRegistro: new Date().toISOString().split("T")[0],
      facturadoPor: "bdp" as "bdp" | "calfc" | "global" | "rgz" | "rjs" | "app",
      clienteProyecto: "",
      fechaParticipacion: "",
      notas: "",
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: createIngresoSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("concepto", value.concepto);
      formData.append("cliente", value.cliente);
      formData.append("clienteId", value.clienteId);
      formData.append("solicitante", value.solicitante.toUpperCase());
      formData.append("autorizador", value.autorizador.toUpperCase());
      formData.append("numeroFactura", value.numeroFactura);
      formData.append("folioFiscal", value.folioFiscal);
      formData.append("periodo", value.periodo);
      formData.append("formaPago", value.formaPago.toUpperCase());
      formData.append("origen", value.origen);
      formData.append("numeroCuenta", value.numeroCuenta);
      formData.append("clabe", value.clabe);
      formData.append("cargoAbono", value.cargoAbono.toUpperCase());
      formData.append("cantidad", String(value.cantidad));
      formData.append("estado", value.estado.toUpperCase());
      formData.append("fechaPago", value.fechaPago || "");
      formData.append("fechaRegistro", value.fechaRegistro);
      formData.append("facturadoPor", value.facturadoPor.toUpperCase());
      formData.append("clienteProyecto", value.clienteProyecto);
      formData.append("fechaParticipacion", value.fechaParticipacion || "");
      formData.append("notas", value.notas || "");

      await createIngresoMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

