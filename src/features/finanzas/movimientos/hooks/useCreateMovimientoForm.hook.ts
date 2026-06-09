"use client";

import { useCallback, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createMovimientoSchema } from "../schemas/createMovimientoSchema";
import { useCreateMovimiento } from "./useCreateMovimiento.hook";

type MovimientoTipo = "INGRESO" | "EGRESO";

function toNullableId(value?: string) {
  return value && value.trim() ? value : null;
}

/**
 * TanStack Form hook for the create movimiento form.
 * Mirrors the useCreateFacturaForm pattern.
 *
 * Returns `{ form, fieldErrors, clearFieldError }`.
 * `fieldErrors` is a `Record<string, string>` populated on submit when Zod
 * validation fails — each key maps to the first error message for that field.
 */
export const useCreateMovimientoForm = (
  tipo: MovimientoTipo,
  onSuccess?: () => void,
) => {
  const createMutation = useCreateMovimiento();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const form = useForm({
    defaultValues: {
      tipo,
      titular: "",
      estadoCuenta: "",
      fechaCorte: "",
      fechaOperacion: "",
      descripcionLiteral: "",
      monto: 0 as number,
      concepto: "",
      descripcionAdministracion: "",
      categoria: "",
      formaPago: "",
      cargoAbono: "",
      facturadoPor: "",
      periodo: "",
      numeroFactura: "",
      folioFiscal: "",
      proveedor: "",
      proveedorId: "",
      cliente: "",
      clienteId: "",
      solicitanteId: "",
      autorizadorId: "",
      notas: "",
    },
    onSubmit: async ({ value }) => {
      // Validate with client schema before submitting
      const parsed = createMovimientoSchema.safeParse(value);
      if (!parsed.success) {
        // Surface per-field errors so the form component can display them
        setFieldErrors(
          Object.fromEntries(
            Object.entries(parsed.error.flatten().fieldErrors).map(
              ([k, v]) => [k, v?.[0] ?? ""],
            ),
          ),
        );
        return;
      }

      // Clear any previous validation errors on successful parse
      setFieldErrors({});

      try {
        await createMutation.mutateAsync({
          ...parsed.data,
          categoria: parsed.data.categoria || null,
          formaPago: parsed.data.formaPago || null,
          cargoAbono: parsed.data.cargoAbono || null,
          facturadoPor: parsed.data.facturadoPor || null,
          periodo: parsed.data.periodo || null,
          numeroFactura: parsed.data.numeroFactura || null,
          folioFiscal: parsed.data.folioFiscal || null,
          concepto: parsed.data.concepto || null,
          descripcionAdministracion:
            parsed.data.descripcionAdministracion || null,
          proveedor: parsed.data.proveedor || null,
          cliente: parsed.data.cliente || null,
          solicitanteId: toNullableId(parsed.data.solicitanteId),
          autorizadorId: toNullableId(parsed.data.autorizadorId),
          proveedorId: toNullableId(parsed.data.proveedorId),
          clienteId: toNullableId(parsed.data.clienteId),
          notas: parsed.data.notas || null,
          estado: "PAGADO",
        });

        onSuccess?.();
      } catch {
        // Error feedback is handled by onError in useCreateMovimiento (toast)
      }
    },
  });

  return { form, fieldErrors, clearFieldError };
};
