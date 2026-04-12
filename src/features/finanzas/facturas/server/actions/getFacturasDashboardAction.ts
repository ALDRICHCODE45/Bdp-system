"use server";

import prisma from "@/core/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import type {
  CurrencyKpis,
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

function getPeriodStart(period: DashboardPeriod): Date {
  const now = new Date();
  if (period === "month")   return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === "quarter") return new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return new Date(now.getFullYear(), 0, 1);
}

function getSeriesMonths(period: DashboardPeriod): number {
  if (period === "month")   return 6;
  if (period === "quarter") return 6;
  return 12;
}

export async function getFacturasDashboardAction(
  period: DashboardPeriod = "month"
): Promise<{ ok: true; data: FacturasDashboardDto } | { ok: false; error: string }> {
  // Solo accesible para usuarios con permiso de acceso o gestión (no Capturador)
  await requireAnyPermission(
    [PermissionActions.facturas.acceder, PermissionActions.facturas.gestionar],
    "No tienes permiso para ver el dashboard de facturas"
  );

  try {
    const periodStart  = getPeriodStart(period);
    const seriesMonths = getSeriesMonths(period);

    // ── 1. KPIs agrupados por moneda ──────────────────────────────────────
    // Usamos groupBy para obtener totales separados por moneda,
    // así evitamos sumar MXN + USD en un mismo número.
    const [facturadoByMoneda, porCobrarByMoneda, cobradoByMoneda, canceladoByMoneda] =
      await Promise.all([
        // Facturado en el período (no cancelado)
        prisma.factura.groupBy({
          by: ["moneda"],
          where: { createdAt: { gte: periodStart }, status: { not: "CANCELADA" } },
          _sum: { total: true },
          _count: { id: true },
        }),
        // Por cobrar (Pendiente de pago, sin restricción de período)
        prisma.factura.groupBy({
          by: ["moneda"],
          where: { statusPago: "Pendiente de pago" },
          _sum: { total: true },
        }),
        // Cobrado en el período (statusPago = Pagado)
        prisma.factura.groupBy({
          by: ["moneda"],
          where: { createdAt: { gte: periodStart }, statusPago: "Pagado" },
          _sum: { total: true },
          _count: { id: true },
        }),
        // Cancelado en el período
        prisma.factura.groupBy({
          by: ["moneda"],
          where: { createdAt: { gte: periodStart }, status: "CANCELADA" },
          _sum: { total: true },
          _count: { id: true },
        }),
      ]);

    // Construimos mapas por moneda para lookups O(1)
    const toMap = (rows: { moneda: string; _sum: { total: Prisma.Decimal | null }; _count?: { id: number } }[]) =>
      new Map(rows.map((r) => [r.moneda, { total: Number(r._sum.total ?? 0), count: r._count?.id ?? 0 }]));

    const facturadoMap  = toMap(facturadoByMoneda);
    const porCobrarMap  = toMap(porCobrarByMoneda);
    const cobradoMap    = toMap(cobradoByMoneda);
    const canceladoMap  = toMap(canceladoByMoneda);

    // Unión de todas las monedas presentes
    const allCurrencies = Array.from(
      new Set([
        ...facturadoMap.keys(),
        ...porCobrarMap.keys(),
        ...cobradoMap.keys(),
        ...canceladoMap.keys(),
      ])
    ).sort();

    const kpisByCurrency: CurrencyKpis[] = allCurrencies.map((moneda) => {
      const facturado  = facturadoMap.get(moneda)  ?? { total: 0, count: 0 };
      const porCobrar  = porCobrarMap.get(moneda)  ?? { total: 0 };
      const cobrado    = cobradoMap.get(moneda)    ?? { total: 0, count: 0 };
      const cancelado  = canceladoMap.get(moneda)  ?? { total: 0, count: 0 };

      const tasaCobro =
        facturado.total > 0
          ? Math.round((cobrado.total / facturado.total) * 100)
          : 0;

      return {
        moneda,
        totalFacturado:     facturado.total,
        totalCobrado:       cobrado.total,
        totalPorCobrar:     porCobrar.total,
        totalCancelado:     cancelado.total,
        cantidadFacturas:   facturado.count,
        cantidadCanceladas: cancelado.count,
        tasaCobro,
      };
    });

    // Moneda primaria = la de mayor volumen facturado
    const primaryCurrency =
      kpisByCurrency.sort((a, b) => b.totalFacturado - a.totalFacturado)[0]?.moneda ?? "MXN";

    // ── 2. Breakdown por status (conteo, todas las monedas) ────────────────
    const statusCounts = await prisma.factura.groupBy({
      by: ["status"],
      where: { createdAt: { gte: periodStart } },
      _count: { id: true },
    });

    const countMap = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.id])
    );

    // ── 3. Serie mensual (moneda primaria únicamente) ──────────────────────
    // Filtramos a la moneda primaria para que el gráfico sea coherente.
    const seriesStart = new Date();
    seriesStart.setMonth(seriesStart.getMonth() - (seriesMonths - 1));
    seriesStart.setDate(1);
    seriesStart.setHours(0, 0, 0, 0);

    const [facturadoRaw, cobradoRaw] = await Promise.all([
      prisma.$queryRaw<{ year: number; month: number; total: Prisma.Decimal }[]>`
        SELECT
          EXTRACT(YEAR  FROM "createdAt")::int AS year,
          EXTRACT(MONTH FROM "createdAt")::int AS month,
          SUM(total)                           AS total
        FROM "Factura"
        WHERE "createdAt" >= ${seriesStart}
          AND status != 'CANCELADA'
          AND moneda  =  ${primaryCurrency}
        GROUP BY year, month
      `,
      prisma.$queryRaw<{ year: number; month: number; total: Prisma.Decimal }[]>`
        SELECT
          EXTRACT(YEAR  FROM "fechaPago")::int AS year,
          EXTRACT(MONTH FROM "fechaPago")::int AS month,
          SUM(total)                           AS total
        FROM "Factura"
        WHERE "fechaPago" >= ${seriesStart}
          AND "statusPago" = 'Pagado'
          AND moneda =  ${primaryCurrency}
        GROUP BY year, month
      `,
    ]);

    const facturadoSeriesMap = new Map(
      facturadoRaw.map((r) => [`${r.year}-${r.month}`, Number(r.total)])
    );
    const cobradoSeriesMap = new Map(
      cobradoRaw.map((r) => [`${r.year}-${r.month}`, Number(r.total)])
    );

    const monthlySeries: MonthlyDataPoint[] = [];
    const cursor = new Date(seriesStart);
    for (let i = 0; i < seriesMonths; i++) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const key    = `${y}-${String(m).padStart(2, "0")}`;
      const mapKey = `${y}-${m}`;
      monthlySeries.push({
        label:      MONTH_LABELS[m]!,
        key,
        facturado:  facturadoSeriesMap.get(mapKey) ?? 0,
        cobrado:    cobradoSeriesMap.get(mapKey)   ?? 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // ── 4. Top 5 clientes (agrupado por cliente × moneda) ─────────────────
    // Incluimos moneda en el groupBy para no mezclar monedas por cliente.
    const topRaw = await prisma.factura.groupBy({
      by: ["rfcReceptor", "nombreReceptor", "moneda"],
      where: {
        createdAt: { gte: periodStart },
        status: { not: "CANCELADA" },
      },
      _sum:   { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10, // tomamos 10 para que si un cliente tiene 2 monedas igual salgan los top 5
    });

    const topClientes: TopClienteItem[] = topRaw.map((r) => ({
      nombre:          r.nombreReceptor ?? r.rfcReceptor,
      rfc:             r.rfcReceptor,
      total:           Number(r._sum.total ?? 0),
      cantidadFacturas: r._count.id,
      moneda:          r.moneda,
    }));

    // ── 5. Últimas 6 facturas (incluye moneda) ────────────────────────────
    const recentRaw = await prisma.factura.findMany({
      select: {
        id:             true,
        concepto:       true,
        nombreReceptor: true,
        total:          true,
        moneda:         true,
        status:         true,
        createdAt:      true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const recentFacturas: RecentFacturaItem[] = recentRaw.map((f) => ({
      id:             f.id,
      concepto:       f.concepto,
      nombreReceptor: f.nombreReceptor,
      total:          Number(f.total),
      moneda:         f.moneda,
      status:         f.status,
      createdAt:      f.createdAt.toISOString(),
    }));

    const dto: FacturasDashboardDto = {
      kpisByCurrency,
      primaryCurrency,
      countVigente:   countMap["VIGENTE"]   ?? 0,
      countCancelada: countMap["CANCELADA"] ?? 0,
      monthlySeries,
      topClientes,
      recentFacturas,
      period,
      generatedAt:    new Date().toISOString(),
    };

    return { ok: true, data: dto };
  } catch (error) {
    console.error("[getFacturasDashboardAction]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al obtener datos del dashboard",
    };
  }
}
