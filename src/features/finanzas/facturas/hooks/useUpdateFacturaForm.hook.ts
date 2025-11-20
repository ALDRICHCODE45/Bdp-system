"use client";
import { useForm } from "@tanstack/react-form";
import { updateFacturaSchemaUI } from "../schemas/updateFacturaSchemaUI";
import { useUpdateFactura } from "./useUpdateFactura.hook";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";

export const useUpdateFacturaForm = (
  factura: FacturaDto,
  onSuccess?: () => void
) => {
  const updateFacturaMutation = useUpdateFactura();

  const form = useForm({
    defaultValues: {
      id: factura.id,
      tipoOrigen: factura.tipoOrigen,
      origenId: factura.origenId,
      clienteProveedorId: factura.clienteProveedorId,
      clienteProveedor: factura.clienteProveedor,
      concepto: factura.concepto,
      monto: factura.monto,
      periodo: factura.periodo,
      numeroFactura: factura.numeroFactura,
      folioFiscal: factura.folioFiscal,
      fechaEmision: factura.fechaEmision.split("T")[0],
      fechaVencimiento: factura.fechaVencimiento.split("T")[0],
      estado: factura.estado,
      formaPago: factura.formaPago,
      rfcEmisor: factura.rfcEmisor,
      rfcReceptor: factura.rfcReceptor,
      direccionEmisor: factura.direccionEmisor,
      direccionReceptor: factura.direccionReceptor,
      fechaPago: factura.fechaPago ? factura.fechaPago.split("T")[0] : "",
      fechaRegistro: factura.fechaRegistro.split("T")[0],
      creadoPor: factura.creadoPor,
      autorizadoPor: factura.autorizadoPor,
      notas: factura.notas || "",
      archivoPdf: factura.archivoPdf || "",
      archivoXml: factura.archivoXml || "",
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: updateFacturaSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("id", value.id);
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
      formData.append("fechaPago", value.fechaPago || "");
      formData.append("fechaRegistro", value.fechaRegistro);
      formData.append("creadoPor", value.creadoPor);
      formData.append("autorizadoPor", value.autorizadoPor);
      formData.append("notas", value.notas || "");
      formData.append("archivoPdf", value.archivoPdf || "");
      formData.append("archivoXml", value.archivoXml || "");

      await updateFacturaMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

