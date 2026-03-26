"use client";
import { useForm } from "@tanstack/react-form";
import { updateFacturaSchemaUI } from "../schemas/updateFacturaSchemaUI";
import { useUpdateFactura } from "./useUpdateFactura.hook";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { format, parseISO } from "date-fns";

export const useUpdateFacturaForm = (
  factura: FacturaDto,
  onSuccess?: () => void
) => {
  const updateFacturaMutation = useUpdateFactura();

  const form = useForm({
    defaultValues: {
      id: factura.id,
      concepto: factura.concepto,
      serie: factura.serie || "",
      folio: factura.folio || "",
      fechaEmision: factura.fechaEmision
        ? format(parseISO(factura.fechaEmision), "yyyy-MM-dd")
        : "",
      subtotal: factura.subtotal,
      iva: factura.iva ?? 0,
      totalImpuestosTransladados: factura.totalImpuestosTransladados || 0,
      totalImpuestosRetenidos: factura.totalImpuestosRetenidos || 0,
      total: factura.total,
      uuid: factura.uuid,
      rfcEmisor: factura.rfcEmisor,
      nombreReceptor: factura.nombreReceptor || "",
      rfcReceptor: factura.rfcReceptor,
      metodoPago: factura.metodoPago || "",
      medioPago: factura.medioPago || "",
      moneda: factura.moneda,
      usoCfdi: factura.usoCfdi || "",
      status: factura.status as "vigente" | "cancelada",
      nombreEmisor: factura.nombreEmisor || "",
      statusPago: factura.statusPago || "",
      fechaPago: factura.fechaPago
        ? format(parseISO(factura.fechaPago), "yyyy-MM-dd")
        : "",
      facturaUrl: factura.facturaUrl || "",
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: updateFacturaSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("id", value.id);
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

      await updateFacturaMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};
