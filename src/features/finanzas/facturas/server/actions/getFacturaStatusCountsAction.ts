"use server";

import prisma from "@/core/lib/prisma";
import { Prisma } from "@prisma/client";
import { parseISO } from "date-fns";
import type { FacturasFilterParams } from "../../types/FacturasFilterParams";

export type FacturaStatusCounts = {
  vigente: number;
  cancelada: number;
};

/**
 * Cuenta facturas agrupadas por status en una sola query eficiente.
 *
 * Respeta todos los filtros activos EXCEPTO `status`, de manera que cada tab
 * siempre muestre su propio conteo independientemente de qué tabs estén seleccionados.
 */
export async function getFacturaStatusCountsAction(
  filters: Omit<FacturasFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder" | "status">
): Promise<{ ok: true; data: FacturaStatusCounts } | { ok: false; error: string }> {
  try {
    const andConditions: Prisma.FacturaWhereInput[] = [];

    // ── Búsqueda global ──────────────────────────────────────────────────────
    if (filters.search) {
      andConditions.push({
        OR: [
          { concepto:       { contains: filters.search, mode: "insensitive" } },
          { uuid:           { contains: filters.search, mode: "insensitive" } },
          { rfcEmisor:      { contains: filters.search, mode: "insensitive" } },
          { rfcReceptor:    { contains: filters.search, mode: "insensitive" } },
          { nombreEmisor:   { contains: filters.search, mode: "insensitive" } },
          { nombreReceptor: { contains: filters.search, mode: "insensitive" } },
        ],
      });
    }

    // ── Quick filters ────────────────────────────────────────────────────────
    if (filters.metodoPago?.length) {
      andConditions.push({ metodoPago: { in: filters.metodoPago } });
    }
    if (filters.moneda?.length) {
      andConditions.push({ moneda: { in: filters.moneda } });
    }
    if (filters.statusPago?.length) {
      andConditions.push({ statusPago: { in: filters.statusPago } });
    }

    // ── Advanced: Identificación ─────────────────────────────────────────────
    if (filters.uuid?.length) {
      andConditions.push({
        OR: filters.uuid.map((u) => ({
          uuid: { contains: u, mode: "insensitive" as const },
        })),
      });
    }
    if (filters.usoCfdi?.length) {
      andConditions.push({ usoCfdi: { in: filters.usoCfdi } });
    }

    // ── Advanced: Emisor ─────────────────────────────────────────────────────
    if (filters.rfcEmisor?.length) {
      andConditions.push({
        OR: filters.rfcEmisor.map((v) => ({
          rfcEmisor: { contains: v, mode: "insensitive" as const },
        })),
      });
    }
    if (filters.nombreEmisor?.length) {
      andConditions.push({
        OR: filters.nombreEmisor.map((v) => ({
          nombreEmisor: { contains: v, mode: "insensitive" as const },
        })),
      });
    }

    // ── Advanced: Receptor ───────────────────────────────────────────────────
    if (filters.rfcReceptor?.length) {
      andConditions.push({
        OR: filters.rfcReceptor.map((v) => ({
          rfcReceptor: { contains: v, mode: "insensitive" as const },
        })),
      });
    }
    if (filters.nombreReceptor?.length) {
      andConditions.push({
        OR: filters.nombreReceptor.map((v) => ({
          nombreReceptor: { contains: v, mode: "insensitive" as const },
        })),
      });
    }

    // ── Advanced: Montos ─────────────────────────────────────────────────────
    const montoCondition: Prisma.FacturaWhereInput = {};
    if (filters.subtotalMin !== undefined || filters.subtotalMax !== undefined) {
      montoCondition.subtotal = {
        ...(filters.subtotalMin !== undefined ? { gte: filters.subtotalMin } : {}),
        ...(filters.subtotalMax !== undefined ? { lte: filters.subtotalMax } : {}),
      };
    }
    if (filters.totalMin !== undefined || filters.totalMax !== undefined) {
      montoCondition.total = {
        ...(filters.totalMin !== undefined ? { gte: filters.totalMin } : {}),
        ...(filters.totalMax !== undefined ? { lte: filters.totalMax } : {}),
      };
    }
    if (Object.keys(montoCondition).length > 0) {
      andConditions.push(montoCondition);
    }

    // ── Advanced: Fechas ─────────────────────────────────────────────────────
    if (filters.fechaPagoFrom || filters.fechaPagoTo) {
      andConditions.push({
        fechaPago: {
          ...(filters.fechaPagoFrom ? { gte: parseISO(filters.fechaPagoFrom) } : {}),
          ...(filters.fechaPagoTo   ? { lte: new Date(filters.fechaPagoTo + "T23:59:59") } : {}),
        },
      });
    }
    if (filters.createdAtFrom || filters.createdAtTo) {
      andConditions.push({
        createdAt: {
          ...(filters.createdAtFrom ? { gte: parseISO(filters.createdAtFrom) } : {}),
          ...(filters.createdAtTo   ? { lte: new Date(filters.createdAtTo + "T23:59:59") } : {}),
        },
      });
    }
    if (filters.updatedAtFrom || filters.updatedAtTo) {
      andConditions.push({
        updatedAt: {
          ...(filters.updatedAtFrom ? { gte: parseISO(filters.updatedAtFrom) } : {}),
          ...(filters.updatedAtTo   ? { lte: new Date(filters.updatedAtTo + "T23:59:59") } : {}),
        },
      });
    }

    // ── Advanced: Auditoría ──────────────────────────────────────────────────
    if (filters.ingresadoPor?.length) {
      andConditions.push({ ingresadoPor: { in: filters.ingresadoPor } });
    }

    const where: Prisma.FacturaWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    // Una sola query groupBy — mucho más eficiente que 4 queries separadas
    const rows = await prisma.factura.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    });

    const counts: FacturaStatusCounts = {
      vigente: 0,
      cancelada: 0,
    };

    for (const row of rows) {
      const key = row.status.toLowerCase() as keyof FacturaStatusCounts;
      if (key in counts) {
        counts[key] = row._count._all;
      }
    }

    return { ok: true, data: counts };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al obtener conteos",
    };
  }
}
