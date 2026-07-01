import { notFound } from "next/navigation";
import { makeColaboradorService } from "@/features/RecursosHumanos/colaboradores/server/services/makeColaboradorService";
import { toColaboradorDto } from "@/features/RecursosHumanos/colaboradores/server/mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";
import { ColaboradorProfilePage } from "@/features/RecursosHumanos/colaboradores/pages/ColaboradorProfilePage";

type Params = Promise<{ colaboradorId: string }>;

interface PageProps {
  params: Params;
}

type VacationBalanceDto = {
  diasDisponibles: number;
  diasTomados: number;
};

type ProfilePayload = {
  colaborador: ReturnType<typeof toColaboradorDto>;
  reportesDirectos: number;
  vacaciones: VacationBalanceDto | null;
};

/**
 * P2 (rh-colaboradores-completo):
 *
 * Replaces the legacy render target at the SAME `[colaboradorId]` route with
 * the new 8-tab profile shell + Resumen KPIs.
 *
 * Resolves pre-fetched data with a single `Promise.all`, including:
 * - colaborador DTO (getById)
 * - reportes-directos count (getReportesDirectos, by socioId)
 * - VacationBalance snapshot (getVacationBalance) — null is the expected state
 *   for collaborators who have never had a balance set (spec cap3 req4).
 *
 * On missing id we hand off to Next.js' 404 page via `notFound()` instead of
 * raising a generic Error (design FLAG-1). Other tabs prefetch their own data
 * in their respective phases — we DO NOT load emergencyContacts, salaryHistory,
 * etc. here on purpose.
 */
async function loadProfile(colaboradorId: string): Promise<ProfilePayload | "not-found"> {
  const colaboradorService = makeColaboradorService({ prisma });

  const byId = await colaboradorService.getById(colaboradorId);
  if (!byId.ok) {
    // Legacy collaborator lookup returned the not-found case as a generic
    // thrown Error. Convert it to Next's 404 boundary (CC7 + design FLAG-1).
    return "not-found";
  }
  const colaborador = toColaboradorDto(byId.value);

  const [reportesResult, vacacionesResult] = await Promise.all([
    colaboradorService.getReportesDirectos(colaborador.socioId),
    colaboradorService.getVacationBalance(colaborador.id),
  ]);

  const reportesDirectos = reportesResult.ok ? reportesResult.value : 0;
  const vacaciones = vacacionesResult.ok
    ? (vacacionesResult.value as VacationBalanceDto | null)
    : null;

  return {
    colaborador,
    reportesDirectos,
    vacaciones,
  };
}

export default async function ColaboradorProfileRoute({ params }: PageProps) {
  const { colaboradorId } = await params;
  const payload = await loadProfile(colaboradorId);
  if (payload === "not-found") {
    notFound();
  }

  return <ColaboradorProfilePage payload={payload} />;
}
