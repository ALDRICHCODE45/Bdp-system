"use server";
import prisma from "@/core/lib/prisma";

export const getOrigenDataAction = async (
  tipoOrigen: "INGRESO" | "EGRESO",
  origenId: string
) => {
  try {
    if (tipoOrigen === "INGRESO") {
      const ingreso = await prisma.ingreso.findUnique({
        where: { id: origenId },
        include: { clienteRef: true },
      });

      if (!ingreso) {
        return { ok: false, error: "Ingreso no encontrado" };
      }

      return {
        ok: true,
        data: {
          clienteProveedorId: ingreso.clienteId,
          clienteProveedor: ingreso.cliente,
          concepto: ingreso.concepto,
          monto: Number(ingreso.cantidad),
          periodo: ingreso.periodo,
          numeroFactura: ingreso.numeroFactura,
          folioFiscal: ingreso.folioFiscal,
          formaPago: ingreso.formaPago,
          fechaPago: ingreso.fechaPago?.toISOString() || null,
          notas: ingreso.notas,
          rfcReceptor: ingreso.clienteRef?.rfc || "",
          direccionReceptor: ingreso.clienteRef?.direccion || "",
          numeroCuenta: ingreso.numeroCuenta,
          clabe: ingreso.clabe,
          banco: ingreso.origen,
        },
      };
    } else {
      const egreso = await prisma.egreso.findUnique({
        where: { id: origenId },
        include: { proveedorRef: true },
      });

      if (!egreso) {
        return { ok: false, error: "Egreso no encontrado" };
      }

      return {
        ok: true,
        data: {
          clienteProveedorId: egreso.proveedorId,
          clienteProveedor: egreso.proveedor,
          concepto: egreso.concepto,
          monto: Number(egreso.cantidad),
          periodo: egreso.periodo,
          numeroFactura: egreso.numeroFactura,
          folioFiscal: egreso.folioFiscal,
          formaPago: egreso.formaPago,
          fechaPago: egreso.fechaPago?.toISOString() || null,
          notas: egreso.notas,
          rfcReceptor: egreso.proveedorRef?.rfc || "",
          direccionReceptor: egreso.proveedorRef?.direccion || "",
          numeroCuenta: egreso.numeroCuenta,
          clabe: egreso.clabe,
          banco: egreso.origen,
        },
      };
    }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener datos del origen",
    };
  }
};

