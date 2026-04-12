"use server";
import { revalidatePath } from "next/cache";
import { makeFacturaService } from "../services/makeFacturaService";
import { toFacturaDto } from "../mappers/facturaMapper";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { parseISO } from "date-fns";
import {
  isCapturadorOnly,
  isWithin24Hours,
} from "@/features/finanzas/facturas/helpers/capturadorUtils";

export const updateFacturaAction = async (input: FormData) => {
  await requireAnyPermission(
    [
      PermissionActions.facturas.capturar,
      PermissionActions.facturas.editar,
      PermissionActions.facturas.gestionar,
    ],
    "No tienes permiso para editar la factura"
  );

  const session = await auth();
  const usuarioId = session?.user?.id || null;
  const userPermissions = session?.user?.permissions ?? [];

  const id = input.get("id") as string;
  const concepto = input.get("concepto") as string;
  const serie = (input.get("serie") as string) || null;
  const folio = (input.get("folio") as string) || null;
  const fechaEmisionString = input.get("fechaEmision");
  const subtotalString = input.get("subtotal");
  const ivaString = input.get("iva");
  const totalImpuestosTrasladadosString = input.get("totalImpuestosTransladados");
  const totalImpuestosRetenidosString = input.get("totalImpuestosRetenidos");
  const totalString = input.get("total");
  const uuid = input.get("uuid") as string;
  const rfcEmisor = input.get("rfcEmisor") as string;
  const nombreReceptor = (input.get("nombreReceptor") as string) || null;
  const rfcReceptor = input.get("rfcReceptor") as string;
  const metodoPago = (input.get("metodoPago") as string) || null;
  const medioPago = (input.get("medioPago") as string) || null;
  const moneda = (input.get("moneda") as string) || "MXN";
  const usoCfdi = (input.get("usoCfdi") as string) || null;
  const status = (input.get("status") || "VIGENTE") as "VIGENTE" | "CANCELADA";
  const nombreEmisor = (input.get("nombreEmisor") as string) || null;
  const statusPago = (input.get("statusPago") as string) || null;
  const fechaPagoString = input.get("fechaPago");
  const facturaUrl = (input.get("facturaUrl") as string) || null;

  const subtotal = subtotalString ? parseFloat(subtotalString as string) : 0;
  const iva = ivaString ? parseFloat(ivaString as string) : null;
  const totalImpuestosTransladados = totalImpuestosTrasladadosString
    ? parseFloat(totalImpuestosTrasladadosString as string)
    : null;
  const totalImpuestosRetenidos = totalImpuestosRetenidosString
    ? parseFloat(totalImpuestosRetenidosString as string)
    : null;
  const total = totalString ? parseFloat(totalString as string) : 0;
  const fechaPago = fechaPagoString ? parseISO(fechaPagoString as string) : null;
  const fechaEmision = fechaEmisionString ? parseISO(fechaEmisionString as string) : null;

  const isCapturador = isCapturadorOnly(userPermissions);

  if (isCapturador) {
    // Obtener la factura existente para verificar ownership y ventana de 24h
    const existingFactura = await prisma.factura.findUnique({
      where: { id },
      select: { ingresadoPor: true, createdAt: true },
    });

    if (!existingFactura) {
      return { ok: false, error: "Factura no encontrada" };
    }

    // Verificar ownership
    if (existingFactura.ingresadoPor !== usuarioId) {
      return { ok: false, error: "No podés editar facturas de otros usuarios" };
    }

    // Verificar ventana de 24 horas
    if (!isWithin24Hours(existingFactura.createdAt)) {
      return {
        ok: false,
        error: "Solo podés editar facturas de las últimas 24 horas",
      };
    }
  }

  const facturaService = makeFacturaService({ prisma });

  let result;

  if (isCapturador) {
    // Capturador: solo campos permitidos, status intacto (no puede cambiarlo)
    result = await facturaService.update({
      id,
      concepto,
      serie,
      folio,
      subtotal,
      iva,
      totalImpuestosTransladados,
      totalImpuestosRetenidos,
      total,
      uuid,
      rfcEmisor,
      nombreEmisor,
      rfcReceptor,
      nombreReceptor,
      moneda,
      usoCfdi,
      status: "VIGENTE",
      usuarioId,
    });
  } else {
    // Flujo normal: todos los campos
    result = await facturaService.update({
      id,
      concepto,
      serie,
      folio,
      fechaEmision,
      subtotal,
      iva,
      totalImpuestosTransladados,
      totalImpuestosRetenidos,
      total,
      uuid,
      rfcEmisor,
      nombreReceptor,
      rfcReceptor,
      metodoPago,
      medioPago,
      moneda,
      usoCfdi,
      status,
      nombreEmisor,
      statusPago,
      fechaPago,
      facturaUrl,
      usuarioId,
    });
  }

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const facturaDto = toFacturaDto(result.value);
  revalidatePath("/facturas");
  return { ok: true, data: facturaDto };
};
