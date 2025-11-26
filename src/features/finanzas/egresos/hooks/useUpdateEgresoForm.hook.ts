"use client";
import { useForm } from "@tanstack/react-form";
import { updateEgresoSchemaUI } from "../schemas/updateEgresoSchemaUI";
import { useUpdateEgreso } from "./useUpdateEgreso.hook";
import { EgresoDto } from "../server/dtos/EgresoDto.dto";

export const useUpdateEgresoForm = (
  egreso: EgresoDto,
  onSuccess?: () => void
) => {
  const updateEgresoMutation = useUpdateEgreso();

  const form = useForm({
    defaultValues: {
      id: egreso.id,
      concepto: egreso.concepto,
      clasificacion: egreso.clasificacion,
      categoria: egreso.categoria,
      proveedor: egreso.proveedor,
      proveedorId: egreso.proveedorId,
      solicitante: egreso.solicitanteNombre || "",
      solicitanteId: egreso.solicitanteId || "",
      autorizador: egreso.autorizadorNombre || "",
      autorizadorId: egreso.autorizadorId || "",
      numeroFactura: egreso.numeroFactura,
      folioFiscal: egreso.folioFiscal,
      periodo: egreso.periodo,
      formaPago: egreso.formaPago,
      origen: egreso.origen,
      numeroCuenta: egreso.numeroCuenta,
      clabe: egreso.clabe,
      cargoAbono: egreso.cargoAbono,
      cantidad: egreso.cantidad,
      estado: egreso.estado,
      fechaPago: egreso.fechaPago
        ? egreso.fechaPago.split("T")[0]
        : "",
      fechaRegistro: egreso.fechaRegistro.split("T")[0],
      facturadoPor: egreso.facturadoPor,
      clienteProyecto: egreso.clienteProyecto ?? "",
      clienteProyectoId: egreso.clienteProyectoId ?? "",
      notas: egreso.notas || "",
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: updateEgresoSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("id", value.id);
      formData.append("concepto", value.concepto);
      formData.append("clasificacion", value.clasificacion.toUpperCase().replace(" ", "_"));
      formData.append("categoria", value.categoria.toUpperCase().replace("Ó", "O"));
      formData.append("proveedor", value.proveedor);
      formData.append("proveedorId", value.proveedorId);
      formData.append("solicitante", value.solicitante);
      formData.append("solicitanteId", value.solicitanteId);
      formData.append("autorizador", value.autorizador);
      formData.append("autorizadorId", value.autorizadorId);
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
      formData.append("clienteProyecto", value.clienteProyecto ?? "");
      formData.append("clienteProyectoId", value.clienteProyectoId ?? "");
      formData.append("notas", value.notas || "");

      await updateEgresoMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

