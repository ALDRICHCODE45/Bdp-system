"use server";
import { makeFacturaService } from "../services/makeFacturaService";
import { toFacturaDto } from "../mappers/facturaMapper";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { isCapturadorOnly } from "@/features/finanzas/facturas/helpers/capturadorUtils";

export const getFacturaByIdAction = async (id: string) => {
  const session = await auth();
  const userId = session?.user?.id;
  const userPermissions = session?.user?.permissions ?? [];

  const facturaService = makeFacturaService({ prisma });
  const result = await facturaService.getById(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  // Si es capturador, verificar que la factura le pertenece
  if (isCapturadorOnly(userPermissions)) {
    if (result.value.ingresadoPor !== userId) {
      return { ok: false, error: "No tenés permiso para ver esta factura" };
    }
  }

  const facturaDto = toFacturaDto(result.value);
  return { ok: true, data: facturaDto };
};
