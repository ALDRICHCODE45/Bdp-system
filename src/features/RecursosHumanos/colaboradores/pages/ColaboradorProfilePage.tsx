"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/shared/ui/tabs";
import { ProfileIdentityRail } from "../components/ProfileIdentityRail";
import { ResumenTab } from "../components/ResumenTab";
import { PersonalTab } from "../components/PersonalTab";
import { LaboralTab } from "../components/LaboralTab";
import { CompensacionTab } from "../components/CompensacionTab";
import { OrganigramaTab } from "../components/OrganigramaTab";
import { DocumentosTab } from "../components/DocumentosTab";
import { CvTab } from "../components/CvTab";
import { AusenciasTab } from "../components/AusenciasTab";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import type { OrgTreeDto } from "../server/dtos/OrgTreeDto.dto";
import type { VacationBalanceDto } from "../server/dtos/VacationBalanceDto.dto";

// EditColaboradorSheet uses forms that import server-only utilities; mount it
// via next/dynamic with ssr:false so it stays out of the RSC critical path.
const EditColaboradorSheet = dynamic(
  () =>
    import("../components/EditColaboradorSheet").then((mod) => ({
      default: mod.EditColaboradorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface ProfilePayload {
  colaborador: ColaboradorDto;
  reportesDirectos: number;
  /**
   * VacationBalance snapshot. `null` means "no row registered yet" —
   * the Resumen KPI and the Ausencias donut both rely on this signal to
   * render their empty states (cap3 req4 + cap9 req5). The canonical
   * full DTO type lives in `VacationBalanceDto.dto.ts`.
   */
  vacaciones: VacationBalanceDto | null;
  orgTree: OrgTreeDto;
}

interface ColaboradorProfilePageProps {
  payload: ProfilePayload;
}

/**
 * P2 — ColaboradorProfilePage (client shell).
 *
 * Mounts the 8-tab profile as required by spec cap2 req2:
 *   Resumen / Personal / Laboral / Compensación / Organigrama /
 *   Documentos / Ausencias / CV
 *
 * Tab state is held in `window.location.hash` so deep-links and reloads
 * restore the same tab (cap2 req5). The hashchange listener keeps external
 * navigation (back/forward, direct `#personal` link) in sync with the local
 * `currentTab` state, while tab clicks push the new hash onto the URL.
 *
 * Resumen (P2) / Personal / Laboral (P3) / Compensación + Organigrama (P4) /
 * Documentos / CV (P5) / Ausencias (P6) all carry live content. P7 cutover
 * removed the legacy `ColaboradorIndividualPage`; this slim 8-tab profile is
 * now the only colaborador detail view in the app (CC10 honored).
 */
export function ColaboradorProfilePage({ payload }: ColaboradorProfilePageProps) {
  const { colaborador, reportesDirectos, vacaciones, orgTree } = payload;

  // Edit flow (cap2 req3): the "Editar" rail button reuses the existing
  // EditColaboradorSheet via dynamic import. The rail owns the click; the
  // modal opens on demand from page state.
  const { isOpen, openModal, closeModal } = useModalState();

  const [currentTab, setCurrentTab] = useState<string>(() =>
    readTabFromHash() ?? DEFAULT_TAB
  );

  // ── hash change listener (cap2 req5) ──────────────────────────────────
  useEffect(() => {
    const onHashChange = () => {
      const next = readTabFromHash();
      if (next && next !== currentTab) {
        setCurrentTab(next);
      } else if (!next) {
        // Hash got removed entirely — fall back to default without pushing
        // a URL write, so we don't trigger another hashchange cycle.
        setCurrentTab(DEFAULT_TAB);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [currentTab]);

  const handleTabChange = useCallback((value: string) => {
    setCurrentTab(value);
    const newHash = `#${value}`;
    if (typeof window !== "undefined" && window.location.hash !== newHash) {
      // Use replaceState when landing on the default to keep the URL clean;
      // otherwise pushState so each tab move is part of the history stack.
      const target = window.location.pathname + newHash;
      if (value === DEFAULT_TAB) {
        window.history.replaceState(null, "", window.location.pathname);
      } else {
        window.history.pushState(null, "", target);
      }
    }
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        {/* Mobile-friendly horizontal scroll wrapper for the tab list. */}
        <div className="overflow-x-auto scrollbar-thin -mx-2 px-2 md:mx-0 md:px-0">
          <TabsList className="w-max min-w-full md:w-auto md:min-w-2/3">
            {TAB_DEFINITIONS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Resumen (only tab with real content in P2) ────────────── */}
        <TabsContent value="resumen" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            <ProfileIdentityRail
              colaborador={colaborador}
              onEdit={openModal}
            />
            <div className="min-w-0">
              <ResumenTab
                colaborador={colaborador}
                reportesDirectos={reportesDirectos}
                vacaciones={vacaciones}
              />
            </div>
          </div>
        </TabsContent>

        {/* ── Personal (P3 — cap4 + cap6 emergency-contact CRUD) ────── */}
        <TabsContent value="personal" className="mt-6">
          <PersonalTab colaborador={colaborador} />
        </TabsContent>

        {/* ── Laboral (P3 — cap5 position + responsabilidad CRUD) ────── */}
        <TabsContent value="laboral" className="mt-6">
          <LaboralTab colaborador={colaborador} />
        </TabsContent>

        {/* ── Compensación (P4 — cap6 compensation-history) ─────────── */}
        <TabsContent value="compensacion" className="mt-6">
          <CompensacionTab colaborador={colaborador} />
        </TabsContent>

        {/* ── Organigrama (P4 — cap7 employee-org-tree) ─────────────── */}
        <TabsContent value="organigrama" className="mt-6">
          <OrganigramaTab tree={orgTree} />
        </TabsContent>

        {/* ── Documentos (P5 — cap8 + cap12) ────────────────────────── */}
        <TabsContent value="documentos" className="mt-6">
          <DocumentosTab colaboradorId={colaborador.id} />
        </TabsContent>

        {/* ── CV (P5 — cap10) ───────────────────────────────────────── */}
        <TabsContent value="cv" className="mt-6">
          <CvTab colaboradorId={colaborador.id} />
        </TabsContent>

        {/* ── Ausencias (P6 — cap9 + cap13) ─────────────────────────── */}
        <TabsContent value="ausencias" className="mt-6">
          <AusenciasTab
            colaboradorId={colaborador.id}
            vacaciones={vacaciones}
          />
        </TabsContent>
      </Tabs>

      {/* Edit modal — only rendered when triggered (mounted lazily). */}
      {isOpen && (
        <EditColaboradorSheet
          isOpen={isOpen}
          onClose={closeModal}
          colaborador={colaborador}
        />
      )}
    </div>
  );
}

/* ── Constants (module-scope) ────────────────────────────────────────────── */

const DEFAULT_TAB = "resumen";

interface TabDefinition {
  value: string;
  label: string;
  /** Which SDD phase will fill this tab in. */
  phase: string;
}

const TAB_DEFINITIONS: readonly TabDefinition[] = [
  { value: "resumen", label: "Resumen", phase: "P2" },
  { value: "personal", label: "Personal", phase: "P3 ✓" },
  { value: "laboral", label: "Laboral", phase: "P3 ✓" },
  { value: "compensacion", label: "Compensación", phase: "P4 ✓" },
  { value: "organigrama", label: "Organigrama", phase: "P4 ✓" },
  { value: "documentos", label: "Documentos", phase: "P5 ✓" },
  { value: "ausencias", label: "Ausencias", phase: "P6 ✓" },
  { value: "cv", label: "CV", phase: "P5 ✓" },
] as const;

/**
 * Read the current URL hash and map it to a known tab value. Anything we
 * don't recognize is ignored (we keep the previously selected tab) — this
 * prevents arbitrary URLs from kicking the user off the Resumen page on a
 * cold load. Returns null when there's no hash or only "#" is present.
 */
function readTabFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.replace(/^#/, "").toLowerCase().trim();
  if (!raw) return null;
  const known = TAB_DEFINITIONS.find((t) => t.value === raw);
  return known ? raw : null;
}
