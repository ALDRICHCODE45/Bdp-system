"use server";

import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { makeFacturaService } from "../services/makeFacturaService";
import { FacturasFilterParams } from "../../types/FacturasFilterParams";
import type { FacturasAggregatesDto } from "../dtos/FacturasAggregatesDto.dto";
import { isCapturadorOnly } from "@/features/finanzas/facturas/helpers/capturadorUtils";

type AggregatesResult =
  | { ok: true; data: FacturasAggregatesDto }
  | { ok: false; error: string };

export async function getFacturasAggregatesAction(
  params: Omit<FacturasFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder">
): Promise<AggregatesResult> {
  const session = await auth();
  const userId = session?.user?.id;
  const userPermissions = session?.user?.permissions ?? [];

  // Si es capturador, forzar filtro de ownership — no puede ser sobreescrito por el front
  const ownershipParams: Partial<typeof params> =
    isCapturadorOnly(userPermissions) && userId
      ? { ingresadoPor: [userId] }
      : {};

  const service = makeFacturaService({ prisma });
  const result = await service.getAggregates({ ...params, ...ownershipParams });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const byCurrency = result.value;
  const totalCount = byCurrency.reduce((acc, row) => acc + row.count, 0);

  return {
    ok: true,
    data: {
      totalCount,
      byCurrency,
    },
  };
}
