"use server";

import prisma from "@/core/lib/prisma";
import { makeFacturaService } from "../services/makeFacturaService";
import { FacturasFilterParams } from "../../types/FacturasFilterParams";
import type { FacturasAggregatesDto } from "../dtos/FacturasAggregatesDto.dto";

type AggregatesResult =
  | { ok: true; data: FacturasAggregatesDto }
  | { ok: false; error: string };

export async function getFacturasAggregatesAction(
  params: Omit<FacturasFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder">
): Promise<AggregatesResult> {
  const service = makeFacturaService({ prisma });
  const result = await service.getAggregates(params);

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
