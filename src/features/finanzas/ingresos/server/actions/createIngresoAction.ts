"use server";
import { revalidatePath } from "next/cache";
import { makeIngresoService } from "../services/makeIngresoService";
import { createIngresoSchema } from "../validators/createIngresoSchema";
import { toIngresoDto } from "../mappers/ingresoMapper";
import prisma from "@/core/lib/prisma";

export const createIngresoAction = async (input: FormData) => {
  const concepto = input.get("concepto");
  const cliente = input.get("cliente");
  const clienteId = input.get("clienteId");
  const solicitante = input.get("solicitante");
  const autorizador = input.get("autorizador");
  const numeroFactura = input.get("numeroFactura");
  const folioFiscal = input.get("folioFiscal");
  const periodo = input.get("periodo");
  const formaPago = input.get("formaPago");
  const origen = input.get("origen");
  const numeroCuenta = input.get("numeroCuenta");
  const clabe = input.get("clabe");
  const cargoAbono = input.get("cargoAbono");
  const cantidadString = input.get("cantidad");
  const estado = input.get("estado");
  const fechaPagoString = input.get("fechaPago");
  const fechaRegistroString = input.get("fechaRegistro");
  const facturadoPor = input.get("facturadoPor");
  const clienteProyecto = input.get("clienteProyecto");
  const fechaParticipacionString = input.get("fechaParticipacion");
  const notas = input.get("notas") || null;

  const cantidad = cantidadString ? parseFloat(cantidadString as string) : 0;
  const fechaPago = fechaPagoString
    ? new Date(fechaPagoString as string)
    : null;
  const fechaRegistro = fechaRegistroString
    ? new Date(fechaRegistroString as string)
    : new Date();
  const fechaParticipacion = fechaParticipacionString
    ? new Date(fechaParticipacionString as string)
    : null;

  // Validación de entrada
  const parsed = createIngresoSchema.parse({
    concepto,
    cliente,
    clienteId,
    solicitante,
    autorizador,
    numeroFactura,
    folioFiscal,
    periodo,
    formaPago,
    origen,
    numeroCuenta,
    clabe,
    cargoAbono,
    cantidad,
    estado,
    fechaPago,
    fechaRegistro,
    facturadoPor,
    clienteProyecto,
    fechaParticipacion,
    notas,
  });

  const ingresoService = makeIngresoService({ prisma });
  const result = await ingresoService.create(parsed);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const ingresoDto = toIngresoDto(result.value);
  revalidatePath("/ingresos");
  return { ok: true, data: ingresoDto };
};

