"use client";
import { useForm } from "@tanstack/react-form";
import { createFacturaSchemaUI } from "../schemas/createFacturaSchemaUI";
import { useCreateFactura } from "./useCreateFactura.hook";

export const useCreateFacturaForm = (onSuccess?: () => void) => {
  const createFacturaMutation = useCreateFactura();

  const form = useForm({
    defaultValues: {
      concepto: "",
      serie: "",
      folio: "",
      fechaEmision: "",
      subtotal: 0,
      iva: 0,
      totalImpuestosTransladados: 0,
      totalImpuestosRetenidos: 0,
      total: 0,
      uuid: "",
      rfcEmisor: "",
      nombreReceptor: "",
      rfcReceptor: "",
      metodoPago: "",
      medioPago: "",
      moneda: "MXN",
      usoCfdi: "",
      status: "vigente" as "vigente" | "cancelada",
      nombreEmisor: "",
      statusPago: "",
      fechaPago: "",
      facturaUrl: "",
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: createFacturaSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("concepto", value.concepto);
      formData.append("serie", value.serie || "");
      formData.append("folio", value.folio || "");
      formData.append("fechaEmision", value.fechaEmision || "");
      formData.append("subtotal", String(value.subtotal));
      formData.append("iva", String(value.iva || ""));
      formData.append(
        "totalImpuestosTransladados",
        String(value.totalImpuestosTransladados || "")
      );
      formData.append(
        "totalImpuestosRetenidos",
        String(value.totalImpuestosRetenidos || "")
      );
      formData.append("total", String(value.total));
      formData.append("uuid", value.uuid);
      formData.append("rfcEmisor", value.rfcEmisor);
      formData.append("nombreReceptor", value.nombreReceptor || "");
      formData.append("rfcReceptor", value.rfcReceptor);
      formData.append("metodoPago", value.metodoPago || "");
      formData.append("medioPago", value.medioPago || "");
      formData.append("moneda", value.moneda);
      formData.append("usoCfdi", value.usoCfdi || "");
      formData.append("status", value.status.toUpperCase());
      formData.append("nombreEmisor", value.nombreEmisor || "");
      formData.append("statusPago", value.statusPago || "");
      formData.append("fechaPago", value.fechaPago || "");
      formData.append("facturaUrl", value.facturaUrl || "");

      await createFacturaMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};
