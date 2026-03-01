"use server";

import prisma from "@/core/lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  DashboardPeriod,
  FacturasDashboardDto,
  MonthlyDataPoint,
  TopClienteItem,
  RecentFacturaItem,
} from "../dtos/FacturasDashboardDto.dto";

const MONTH_LABELS: Record<number, string> = {
  1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr",
  5: "May", 6: "Jun", 7: "Jul", 8: "Ago",
  9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic",
};

/** Retorna la fecha de inicio según el período seleccionado */
function getPeriodStart(period: DashboardPeriod): Date {
  const now = new Date();
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (period === "quarter") {
    return new Date(now.getFullYear(), now.getMonth() - 2, 1);
  }
  // year
  return new Date(now.getFullYear(), 0, 1);
}

/** Cuántos meses mostrar en la serie temporal */
function getSeriesMonths(period: DashboardPeriod): number {
  if (period === "month") return 6;
  if (period === "quarter") return 6;
  return 12;
}

export async function getFacturasDashboardAction(
  period: DashboardPeriod = "month"
): Promise<{ ok: true; data: FacturasDashboardDto } | { ok: false; error: string }> {
  try {
    const periodStart = getPeriodStart(period);
    const seriesMonths = getSeriesMonths(period);

    // ── 1. KPIs del período ────────────────────────────────────────────────
    const [kpiAgg, totalPorCobrarAgg, cobradaAgg, canceladaAgg] = await Promise.all([
      prisma.factura.aggregate({
        where: {
          createdAt: { gte: periodStart },
          status: { not: "CANCELADA" },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
      // Por cobrar: todas las ENVIADA sin importar período
      prisma.factura.aggregate({
        where: { status: "ENVIADA" },
        _sum: { total: true },
      }),
      prisma.factura.aggregate({
        where: {
          createdAt: { gte: periodStart },
          status: "PAGADA",
        },
        _sum: { total: true },
      }),
      // Total cancelado: suma de total para CANCELADA en el período
      prisma.factura.aggregate({
        where: {
          createdAt: { gte: periodStart },
          status: "CANCELADA",
        },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    const totalFacturado = Number(kpiAgg._sum.total ?? 0);
    const totalCobrado = Number(cobradaAgg._sum.total ?? 0);
    const totalPorCobrar = Number(totalPorCobrarAgg._sum.total ?? 0);
    const totalCancelado = Number(canceladaAgg._sum.total ?? 0);
    const cantidadFacturas = kpiAgg._count.id;
    const cantidadCanceladas = canceladaAgg._count.id;
    const tasaCobro =
      totalFacturado > 0
        ? Math.round((totalCobrado / totalFacturado) * 100)
        : 0;

    // ── 2. Breakdown por status (período) ──────────────────────────────────
    const statusCounts = await prisma.factura.groupBy({
      by: ["status"],
      where: { createdAt: { gte: periodStart } },
      _count: { id: true },
    });

    const countMap = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.id])
    );

    // ── 3. Serie mensual ───────────────────────────────────────────────────
    const seriesStart = new Date();
    seriesStart.setMonth(seriesStart.getMonth() - (seriesMonths - 1));
    seriesStart.setDate(1);
    seriesStart.setHours(0, 0, 0, 0);

    // Facturado por mes (usando createdAt)
    const facturadoRaw = await prisma.$queryRaw<
      { year: number; month: number; total: Prisma.Decimal }[]
    >`
      SELECT
        EXTRACT(YEAR FROM "createdAt")::int  AS year,
        EXTRACT(MONTH FROM "createdAt")::int AS month,
        SUM(total)                           AS total
      FROM "Factura"
      WHERE "createdAt" >= ${seriesStart}
        AND status != 'CANCELADA'
      GROUP BY year, month
    `;

    // Cobrado por mes (usando fechaPago)
    const cobradoRaw = await prisma.$queryRaw<
      { year: number; month: number; total: Prisma.Decimal }[]
    >`
      SELECT
        EXTRACT(YEAR FROM "fechaPago")::int  AS year,
        EXTRACT(MONTH FROM "fechaPago")::int AS month,
        SUM(total)                           AS total
      FROM "Factura"
      WHERE "fechaPago" >= ${seriesStart}
        AND status = 'PAGADA'
      GROUP BY year, month
    `;

    // Construir mapa de series
    const facturadoMap = new Map(
      facturadoRaw.map((r) => [`${r.year}-${r.month}`, Number(r.total)])
    );
    const cobradoMap = new Map(
      cobradoRaw.map((r) => [`${r.year}-${r.month}`, Number(r.total)])
    );

    const monthlySeries: MonthlyDataPoint[] = [];
    const cursor = new Date(seriesStart);
    for (let i = 0; i < seriesMonths; i++) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const mapKey = `${y}-${m}`;
      monthlySeries.push({
        label: MONTH_LABELS[m]!,
        key,
        facturado: facturadoMap.get(mapKey) ?? 0,
        cobrado: cobradoMap.get(mapKey) ?? 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // ── 4. Top 5 clientes ─────────────────────────────────────────────────
    const topRaw = await prisma.factura.groupBy({
      by: ["rfcReceptor", "nombreReceptor"],
      where: {
        createdAt: { gte: periodStart },
        status: { not: "CANCELADA" },
      },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    const topClientes: TopClienteItem[] = topRaw.map((r) => ({
      nombre: r.nombreReceptor ?? r.rfcReceptor,
      rfc: r.rfcReceptor,
      total: Number(r._sum.total ?? 0),
      cantidadFacturas: r._count.id,
    }));

    // ── 5. Últimas 6 facturas ─────────────────────────────────────────────
    const recentRaw = await prisma.factura.findMany({
      select: {
        id: true,
        concepto: true,
        nombreReceptor: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const recentFacturas: RecentFacturaItem[] = recentRaw.map((f) => ({
      id: f.id,
      concepto: f.concepto,
      nombreReceptor: f.nombreReceptor,
      total: Number(f.total),
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    }));

    const dto: FacturasDashboardDto = {
      totalFacturado,
      totalCobrado,
      totalPorCobrar,
      cantidadFacturas,
      cantidadCanceladas,
      tasaCobro,
      countBorrador: countMap["BORRADOR"] ?? 0,
      countEnviada: countMap["ENVIADA"] ?? 0,
      countPagada: countMap["PAGADA"] ?? 0,
      countCancelada: countMap["CANCELADA"] ?? 0,
      totalCancelado,
      countBorradorTotal: countMap["BORRADOR"] ?? 0,
      monthlySeries,
      topClientes,
      recentFacturas,
      period,
      generatedAt: new Date().toISOString(),
    };

    return { ok: true, data: dto };
  } catch (error) {
    console.error("[getFacturasDashboardAction]", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener datos del dashboard",
    };
  }
}
