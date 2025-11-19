"use client";
import { useForm } from "@tanstack/react-form";
import { updateIngresoSchemaUI } from "../schemas/updateIngresoSchemaUI";
import { useUpdateIngreso } from "./useUpdateIngreso.hook";
import { IngresoDto } from "../server/dtos/IngresoDto.dto";

export const useUpdateIngresoForm = (
  ingreso: IngresoDto,
  onSuccess?: () => void
) => {
  const updateIngresoMutation = useUpdateIngreso();

  const form = useForm({
    defaultValues: {
      concepto: ingreso.concepto,
      cliente: ingreso.cliente,
      clienteId: ingreso.clienteId,
      solicitante: ingreso.solicitante as "rjs" | "rgz" | "calfc",
      autorizador: ingreso.autorizador as "rjs" | "rgz" | "calfc",
      numeroFactura: ingreso.numeroFactura,
      folioFiscal: ingreso.folioFiscal,
      periodo: ingreso.periodo,
      formaPago: ingreso.formaPago as "transferencia" | "efectivo" | "cheque",
      origen: ingreso.origen,
      numeroCuenta: ingreso.numeroCuenta,
      clabe: ingreso.clabe,
      cargoAbono: ingreso.cargoAbono as "bdp" | "calfc",
      cantidad: ingreso.cantidad,
      estado: ingreso.estado as "pagado" | "pendiente" | "cancelado",
      fechaPago: ingreso.fechaPago
        ? new Date(ingreso.fechaPago).toISOString().split("T")[0]
        : "",
      fechaRegistro: new Date(ingreso.fechaRegistro)
        .toISOString()
        .split("T")[0],
      facturadoPor: ingreso.facturadoPor as
        | "bdp"
        | "calfc"
        | "global"
        | "rgz"
        | "rjs"
        | "app",
      clienteProyecto: ingreso.clienteProyecto,
      fechaParticipacion: ingreso.fechaParticipacion
        ? new Date(ingreso.fechaParticipacion).toISOString().split("T")[0]
        : "",
      notas: ingreso.notas || "",
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: updateIngresoSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("id", ingreso.id);
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

      await updateIngresoMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

