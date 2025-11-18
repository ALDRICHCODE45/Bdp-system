"use server";
import { revalidatePath } from "next/cache";
import { makeEgresoService } from "../services/makeEgresoService";
import { updateEgresoSchema } from "../validators/updateEgresoSchema";
import { toEgresoDto } from "../mappers/egresoMapper";
import prisma from "@/core/lib/prisma";

export const updateEgresoAction = async (input: FormData) => {
  const id = input.get("id");
  const concepto = input.get("concepto");
  const clasificacion = input.get("clasificacion");
  const categoria = input.get("categoria");
  const proveedor = input.get("proveedor");
  const proveedorId = input.get("proveedorId");
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
  const clienteProyectoId = input.get("clienteProyectoId");
  const notas = input.get("notas") || null;

  const cantidad = cantidadString ? parseFloat(cantidadString as string) : 0;
  const fechaPago = fechaPagoString
    ? new Date(fechaPagoString as string)
    : null;
  const fechaRegistro = fechaRegistroString
    ? new Date(fechaRegistroString as string)
    : new Date();

  // Validación de entrada
  const parsed = updateEgresoSchema.parse({
    id,
    concepto,
    clasificacion,
    categoria,
    proveedor,
    proveedorId,
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
    clienteProyectoId,
    notas,
  });

  const egresoService = makeEgresoService({ prisma });
  const result = await egresoService.update(parsed);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const egresoDto = toEgresoDto(result.value);
  revalidatePath("/egresos");
  return { ok: true, data: egresoDto };
};
