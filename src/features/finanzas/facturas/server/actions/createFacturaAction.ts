"use server";
import { revalidatePath } from "next/cache";
import { makeFacturaService } from "../services/makeFacturaService";
import { toFacturaDto } from "../mappers/facturaMapper";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";

export const createFacturaAction = async (input: FormData) => {
  const session = await auth();
  const usuarioId = session?.user?.id || null;

  const tipoOrigen = input.get("tipoOrigen") as "INGRESO" | "EGRESO";
  const origenId = input.get("origenId") as string;
  const clienteProveedorId = input.get("clienteProveedorId") as string;
  const clienteProveedor = input.get("clienteProveedor") as string;
  const concepto = input.get("concepto") as string;
  const montoString = input.get("monto");
  const periodo = input.get("periodo") as string;
  const numeroFactura = input.get("numeroFactura") as string;
  const folioFiscal = input.get("folioFiscal") as string;
  const fechaEmisionString = input.get("fechaEmision");
  const fechaVencimientoString = input.get("fechaVencimiento");
  const estado = (input.get("estado") ||
    "BORRADOR") as "BORRADOR" | "ENVIADA" | "PAGADA" | "CANCELADA";
  const formaPago = input.get("formaPago") as
    | "TRANSFERENCIA"
    | "EFECTIVO"
    | "CHEQUE";
  const rfcEmisor = input.get("rfcEmisor") as string;
  const rfcReceptor = input.get("rfcReceptor") as string;
  const direccionEmisor = input.get("direccionEmisor") as string;
  const direccionReceptor = input.get("direccionReceptor") as string;
  const fechaPagoString = input.get("fechaPago");
  const fechaRegistroString = input.get("fechaRegistro");
  const creadoPor = input.get("creadoPor") as string;
  const autorizadoPor = input.get("autorizadoPor") as string;
  const notas = input.get("notas") || null;

  const monto = montoString ? parseFloat(montoString as string) : 0;
  const fechaEmision = fechaEmisionString
    ? new Date(fechaEmisionString as string)
    : new Date();
  const fechaVencimiento = fechaVencimientoString
    ? new Date(fechaVencimientoString as string)
    : new Date();
  const fechaPago = fechaPagoString
    ? new Date(fechaPagoString as string)
    : null;
  const fechaRegistro = fechaRegistroString
    ? new Date(fechaRegistroString as string)
    : new Date();

  const facturaService = makeFacturaService({ prisma });
  const result = await facturaService.create({
    tipoOrigen,
    origenId,
    clienteProveedorId,
    clienteProveedor,
    concepto,
    monto,
    periodo,
    numeroFactura,
    folioFiscal,
    fechaEmision,
    fechaVencimiento,
    estado,
    formaPago,
    rfcEmisor,
    rfcReceptor,
    direccionEmisor,
    direccionReceptor,
    fechaPago,
    fechaRegistro,
    creadoPor,
    autorizadoPor,
    notas: notas as string | null,
    usuarioId,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const facturaDto = toFacturaDto(result.value);
  revalidatePath("/facturas");
  return { ok: true, data: facturaDto };
};

