"use client";
import { useForm } from "@tanstack/react-form";
import { createEgresoSchemaUI } from "../schemas/createEgresoSchemaUI";
import { useCreateEgreso } from "./useCreateEgreso.hook";

export const useCreateEgresoForm = (onSuccess?: () => void) => {
  const createEgresoMutation = useCreateEgreso();

  const form = useForm({
    defaultValues: {
      concepto: "",
      clasificacion: "gasto op" as
        | "gasto op"
        | "honorarios"
        | "servicios"
        | "arrendamiento"
        | "comisiones"
        | "disposición",
      categoria: "facturación" as
        | "facturación"
        | "comisiones"
        | "disposición"
        | "bancarizaciones",
      proveedor: "",
      proveedorId: "",
      solicitante: "rjs" as "rjs" | "rgz" | "calfc",
      autorizador: "rjs" as "rjs" | "rgz" | "calfc",
      numeroFactura: "",
      folioFiscal: "",
      periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
      formaPago: "transferencia" as "transferencia" | "efectivo" | "cheque",
      origen: "",
      numeroCuenta: "",
      clabe: "",
      cargoAbono: "bdp" as "bdp" | "calfc" | "global" | "rjz" | "app",
      cantidad: 0,
      estado: "pendiente" as "pagado" | "pendiente" | "cancelado",
      fechaPago: "",
      fechaRegistro: new Date().toISOString().split("T")[0],
      facturadoPor: "bdp" as "bdp" | "calfc" | "global" | "rgz" | "rjs" | "app",
      clienteProyecto: "",
      clienteProyectoId: "",
      notas: "",
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: createEgresoSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("concepto", value.concepto);
      formData.append("clasificacion", value.clasificacion.toUpperCase().replace(" ", "_"));
      formData.append("categoria", value.categoria.toUpperCase().replace("Ó", "O"));
      formData.append("proveedor", value.proveedor);
      formData.append("proveedorId", value.proveedorId);
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
      formData.append("clienteProyecto", value.clienteProyecto ?? "");
      formData.append("clienteProyectoId", value.clienteProyectoId ?? "");
      formData.append("notas", value.notas || "");

      await createEgresoMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

