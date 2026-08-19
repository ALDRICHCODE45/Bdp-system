"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { Card, CardContent } from "@/core/shared/ui/card";

import { useGetActiveTarifas } from "../hooks/useGetActiveTarifas.hook";
import { tarifasAbogadoAsuntoColumns } from "../components/TarifasAbogadoAsuntoTableColumns";
import { TarifasAbogadoAsuntoTableConfig } from "../components/TarifasAbogadoAsuntoTableConfig";

const CreateTarifaSheet = dynamic(
  () =>
    import("../components/CreateTarifaSheet").then((mod) => ({
      default: mod.CreateTarifaSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

export function TarifasAbogadoAsuntoTablePage() {
  const { isOpen, openModal, closeModal } = useModalState();
  const [search, setSearch] = useState("");

  const { data, isPending, isFetching } = useGetActiveTarifas();

  // Client-side filter
  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (r) =>
        r.usuarioNombre.toLowerCase().includes(term) ||
        r.asuntoJuridicoNombre.toLowerCase().includes(term) ||
        r.usuarioEmail.toLowerCase().includes(term)
    );
  }, [data, search]);

  const handleGlobalFilterChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const tableConfig = useMemo(
    () =>
      createTableConfig(TarifasAbogadoAsuntoTableConfig, {
        onAdd: openModal,
        serverSide: { enabled: false },
      }),
    [openModal]
  );

  return (
    <Card className="p-2 m-1">
      <CardContent>
        <div className="space-y-6">
          <TablePresentation
            title="Tarifas por Abogado y Asunto"
            subtitle="Define el valor por hora (MXN) que se le paga a cada abogado por cada asunto"
          />

          <PermissionGuard
            permissions={[PermissionActions["juridico-tarifas"].gestionar]}
            fallback={
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No tenés permisos para ver las tarifas.
                </p>
              </div>
            }
          >
            <DataTable
              columns={tarifasAbogadoAsuntoColumns}
              data={filteredData}
              config={tableConfig}
              isLoading={isPending && !data}
              isFetching={isFetching && !!data}
              onGlobalFilterChange={handleGlobalFilterChange}
            />
          </PermissionGuard>

          <PermissionGuard
            permissions={[PermissionActions["juridico-tarifas"].gestionar]}
          >
            {isOpen && (
              <CreateTarifaSheet isOpen={true} onClose={closeModal} />
            )}
          </PermissionGuard>
        </div>
      </CardContent>
    </Card>
  );
}
