import { notFound } from "next/navigation";
import { makeColaboradorService } from "@/features/RecursosHumanos/colaboradores/server/services/makeColaboradorService";
import { makeVacationBalanceService } from "@/features/RecursosHumanos/colaboradores/server/services/makeVacationBalanceService";
import { toColaboradorDto } from "@/features/RecursosHumanos/colaboradores/server/mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";
import { ColaboradorProfilePage } from "@/features/RecursosHumanos/colaboradores/pages/ColaboradorProfilePage";
import type { OrgTreeDto } from "@/features/RecursosHumanos/colaboradores/server/dtos/OrgTreeDto.dto";
import type { VacationBalanceDto } from "@/features/RecursosHumanos/colaboradores/server/dtos/VacationBalanceDto.dto";

type Params = Promise<{ colaboradorId: string }>;

interface PageProps {
  params: Params;
}

type ProfilePayload = {
  colaborador: ReturnType<typeof toColaboradorDto>;
  reportesDirectos: number;
  vacaciones: VacationBalanceDto | null;
  orgTree: OrgTreeDto;
};

/**
 * P2 + P4 + P6 (rh-colaboradores-completo):
 *
 * The collaborator detail route at `[colaboradorId]`. Renders the 8-tab
 * profile shell (Resumen KPIs + Personal/Laboral/Compensación/Organigrama/
 * Documentos/Ausencias/CV tabs). History: P2 landed the shell + Resumen,
 * P4 added the Organigrama prefetch + tree, P6 swapped Vacations prefetch
 * to the canonical full DTO and added the Ausencias tab.
 *
 * Resolves pre-fetched data with a single `Promise.all`, including:
 * - colaborador DTO (getById)
 * - reportes-directos count (getReportesDirectos, by socioId)
 * - VacationBalance snapshot (vacationBalanceService.getByColaborador) — null
 *   is the expected state for collaborators who have never had a balance set
 *   (spec cap3 req4 + cap9 req5). P6 swapped the slim P2 read for the new
 *   P6 service so the canonical full DTO is what reaches the client.
 * - Organigrama tree grouped by socioId (cap7 — P4).
 *
 * On missing id we hand off to Next.js' 404 page via `notFound()` instead of
 * raising a generic Error (design FLAG-1). Per-tab data (emergencyContacts,
 * salaryHistory, etc.) is fetched lazily by each tab via TanStack Query.
 */
async function loadProfile(colaboradorId: string): Promise<ProfilePayload | "not-found"> {
  const colaboradorService = makeColaboradorService({ prisma });
  const vacationBalanceService = makeVacationBalanceService({ prisma });

  const byId = await colaboradorService.getById(colaboradorId);
  if (!byId.ok) {
    // Legacy collaborator lookup returned the not-found case as a generic
    // thrown Error. Convert it to Next's 404 boundary (CC7 + design FLAG-1).
    return "not-found";
  }
  const colaborador = toColaboradorDto(byId.value);

  const [reportesResult, vacacionesResult, orgTreeResult] = await Promise.all([
    colaboradorService.getReportesDirectos(colaborador.socioId),
    vacationBalanceService.getByColaborador(colaborador.id),
    colaboradorService.getOrgTreeBySocio(colaborador.id),
  ]);

  const reportesDirectos = reportesResult.ok ? reportesResult.value : 0;
  const vacaciones = vacacionesResult.ok ? vacacionesResult.value : null;
  const orgTree = orgTreeResult.ok
    ? orgTreeResult.value
    : { currentColaboradorId: colaborador.id, nodes: [] };

  return {
    colaborador,
    reportesDirectos,
    vacaciones,
    orgTree,
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
