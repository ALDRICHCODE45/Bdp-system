"use server";
import { makeFacturaService } from "../services/makeFacturaService";
import { toFacturaDtoArray } from "../mappers/facturaMapper";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { PaginatedResult } from "@/core/shared/types/pagination.types";
import { FacturaDto } from "../dtos/FacturaDto.dto";
import { FacturasFilterParams } from "../../types/FacturasFilterParams";
import { isCapturadorOnly } from "@/features/finanzas/facturas/helpers/capturadorUtils";

export const getPaginatedFacturasAction = async (
  params: FacturasFilterParams
): Promise<{ ok: true; data: PaginatedResult<FacturaDto> } | { ok: false; error: string }> => {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const session = await auth();
  const userId = session?.user?.id;
  const userPermissions = session?.user?.permissions ?? [];

  // Si es capturador, forzar filtro de ownership — no puede ser sobreescrito por el front
  const ownershipParams: Partial<FacturasFilterParams> =
    isCapturadorOnly(userPermissions) && userId
      ? { ingresadoPor: [userId] }
      : {};

  const service = makeFacturaService({ prisma });
  const result = await service.getPaginated({
    ...params,
    ...ownershipParams,
    page,
    pageSize,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const dtos = toFacturaDtoArray(result.value.data);
  return {
    ok: true,
    data: {
      data: dtos,
      totalCount: result.value.totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(result.value.totalCount / pageSize),
    },
  };
};
