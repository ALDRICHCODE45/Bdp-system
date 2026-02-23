"use server";
import { revalidatePath } from "next/cache";
import { makeFacturaService } from "../services/makeFacturaService";
import { toFacturaDto } from "../mappers/facturaMapper";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const createFacturaAction = async (input: FormData) => {
  await requireAnyPermission(
    [PermissionActions.facturas.crear, PermissionActions.facturas.gestionar],
    "No tienes permiso para crear la factura"
  );

  const session = await auth();
  const usuarioId = session?.user?.id || null;

  const concepto = input.get("concepto") as string;
  const serie = (input.get("serie") as string) || null;
  const folio = (input.get("folio") as string) || null;
  const subtotalString = input.get("subtotal");
  const totalImpuestosTrasladadosString = input.get("totalImpuestosTransladados");
  const totalImpuestosRetenidosString = input.get("totalImpuestosRetenidos");
  const totalString = input.get("total");
  const uuid = input.get("uuid") as string;
  const rfcEmisor = input.get("rfcEmisor") as string;
  const nombreReceptor = (input.get("nombreReceptor") as string) || null;
  const rfcReceptor = input.get("rfcReceptor") as string;
  const metodoPago = (input.get("metodoPago") as string) || null;
  const moneda = (input.get("moneda") as string) || "MXN";
  const usoCfdi = (input.get("usoCfdi") as string) || null;
  const status = (input.get("status") || "BORRADOR") as
    | "BORRADOR"
    | "ENVIADA"
    | "PAGADA"
    | "CANCELADA";
  const nombreEmisor = (input.get("nombreEmisor") as string) || null;
  const statusPago = (input.get("statusPago") as string) || null;
  const fechaPagoString = input.get("fechaPago");

  const subtotal = subtotalString ? parseFloat(subtotalString as string) : 0;
  const totalImpuestosTransladados = totalImpuestosTrasladadosString
    ? parseFloat(totalImpuestosTrasladadosString as string)
    : null;
  const totalImpuestosRetenidos = totalImpuestosRetenidosString
    ? parseFloat(totalImpuestosRetenidosString as string)
    : null;
  const total = totalString ? parseFloat(totalString as string) : 0;
  const fechaPago = fechaPagoString
    ? new Date(fechaPagoString as string)
    : null;

  const facturaService = makeFacturaService({ prisma });
  const result = await facturaService.create({
    concepto,
    serie,
    folio,
    subtotal,
    totalImpuestosTransladados,
    totalImpuestosRetenidos,
    total,
    uuid,
    rfcEmisor,
    nombreReceptor,
    rfcReceptor,
    metodoPago,
    moneda,
    usoCfdi,
    status,
    nombreEmisor,
    statusPago,
    fechaPago,
    usuarioId,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const facturaDto = toFacturaDto(result.value);
  revalidatePath("/facturas");
  return { ok: true, data: facturaDto };
};
