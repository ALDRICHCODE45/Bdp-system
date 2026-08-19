"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useGetEquiposJuridicos } from "@/features/juridico/equipos/hooks/useGetEquiposJuridicos.hook";
import { useGetJuridicoClientes } from "@/features/juridico/clientes-directorio/hooks/useGetJuridicoClientes.hook";
import { useGetAsuntosJuridicos } from "@/features/juridico/asuntos/hooks/useGetAsuntosJuridicos.hook";
import { useGetSocios } from "../hooks/useGetSocios.hook";
import { useGetActiveUsersForReporte } from "../hooks/useGetActiveUsersForReporte.hook";

export interface ReporteEntities {
  equipos: { id: string; nombre: string }[] | undefined;
  clientes: { id: string; nombre: string }[] | undefined;
  asuntos: { id: string; nombre: string }[] | undefined;
  socios: { id: string; nombre: string }[] | undefined;
  usuarios: { id: string; name: string }[] | undefined;
}

const ReporteEntitiesContext = createContext<ReporteEntities | null>(null);

interface ReporteHorasAgrupadoProviderProps {
  children: ReactNode;
}

/**
 * Hoists the five entity queries used by the reporte de horas tree so that
 * View and Filters share a single cache. TanStack Query already dedupes by
 * key, but having one place that owns the hooks makes the data flow
 * explicit and lets us add cross-cutting concerns (loading flags, etc.)
 * without touching consumers.
 */
export function ReporteHorasAgrupadoProvider({
  children,
}: ReporteHorasAgrupadoProviderProps) {
  const { data: equipos } = useGetEquiposJuridicos();
  const { data: clientes } = useGetJuridicoClientes();
  const { data: asuntos } = useGetAsuntosJuridicos();
  const { data: socios } = useGetSocios();
  const { data: usuarios } = useGetActiveUsersForReporte();

  const value: ReporteEntities = {
    equipos,
    clientes,
    asuntos,
    socios,
    usuarios,
  };

  return (
    <ReporteEntitiesContext.Provider value={value}>
      {children}
    </ReporteEntitiesContext.Provider>
  );
}

/**
 * Access the cached entity lists provided by `ReporteHorasAgrupadoProvider`.
 * The hook MUST be used inside the provider — calling it outside throws,
 * to avoid silently degrading to the old duplicate-hook pattern.
 */
export function useReporteEntities(): ReporteEntities {
  const ctx = useContext(ReporteEntitiesContext);
  if (!ctx) {
    throw new Error(
      "useReporteEntities must be used inside <ReporteHorasAgrupadoProvider />",
    );
  }
  return ctx;
}
