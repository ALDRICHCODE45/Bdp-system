"use server";
import { revalidatePath } from "next/cache";
import { makeEgresoService } from "../services/makeEgresoService";
import { updateEgresoSchema } from "../validators/updateEgresoSchema";
import { toEgresoDto } from "../mappers/egresoMapper";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const updateEgresoAction = async (input: FormData) => {
  // Verificar permiso antes de continuar
  await requireAnyPermission(
    [
      PermissionActions.egresos.editar,
      PermissionActions.egresos.gestionar,
    ],
    "No tienes permiso para editar egresos"
  );

  // Obtener usuario autenticado
  const session = await auth();
  const usuarioId = session?.user?.id || null;
  const id = input.get("id");
  const concepto = input.get("concepto");
  const clasificacion = input.get("clasificacion");
  const categoria = input.get("categoria");
  const proveedor = input.get("proveedor");
  const proveedorId = input.get("proveedorId");
  const solicitante = input.get("solicitante");
  const solicitanteId = input.get("solicitanteId");
  const autorizador = input.get("autorizador");
  const autorizadorId = input.get("autorizadorId");
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
  const rawClienteProyecto = input.get("clienteProyecto");
  const rawClienteProyectoId = input.get("clienteProyectoId");
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
    solicitanteId,
    autorizador,
    autorizadorId,
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
    clienteProyecto:
      typeof rawClienteProyecto === "string" &&
      rawClienteProyecto.trim().length > 0
        ? rawClienteProyecto
        : null,
    clienteProyectoId:
      typeof rawClienteProyectoId === "string" &&
      rawClienteProyectoId.trim().length > 0
        ? rawClienteProyectoId
        : null,
    notas,
  });

  const egresoService = makeEgresoService({ prisma });
  const result = await egresoService.update({
    ...parsed,
    clienteProyecto: parsed.clienteProyecto ?? null,
    clienteProyectoId: parsed.clienteProyectoId ?? null,
    usuarioId,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const egresoDto = toEgresoDto(result.value);
  revalidatePath("/egresos");
  return { ok: true, data: egresoDto };
};
