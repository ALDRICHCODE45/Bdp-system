"use client";

import { useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { columns } from "../components/FacturasTableColumns";
import { FacturasTableConfig } from "../components/FacturasTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { ImportFacturasDialog } from "../components/import";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useFacturas } from "../hooks/useFacturas.hook";

const CreateFacturaSheet = dynamic(
  () =>
    import("../components/CreateFacturaSheet").then((mod) => ({
      default: mod.CreateFacturaSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function FacturasTablePage() {
  const { isOpen, openModal, closeModal } = useModalState();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const tableConfig = createTableConfig(FacturasTableConfig, {
    onAdd: () => openModal(),
    onImport: () => setImportDialogOpen(true),
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: tableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isPending, isFetching } = useFacturas({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
  });

  const serverConfig = useMemo(() => ({
    ...tableConfig,
    pagination: {
      ...tableConfig.pagination,
      manualPagination: true,
      pageCount: data?.pageCount ?? 0,
      totalCount: data?.totalCount ?? 0,
      onPaginationChange: setPagination,
    },
    manualSorting: true,
    onSortingChange: setSorting,
  }), [tableConfig, data?.pageCount, data?.totalCount]);

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra y gestiona las facturas de tu empresa"
        title="Gestion de Facturas"
      />
      <PermissionGuard
        permissions={[
          PermissionActions.facturas.acceder,
          PermissionActions.facturas.gestionar,
        ]}
      >
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          config={serverConfig}
          isLoading={isPending && !isFetching}
        />
      </PermissionGuard>

      {/* Modal con lazy loading */}

      <PermissionGuard
        permissions={[
          PermissionActions.facturas.crear,
          PermissionActions.facturas.gestionar,
        ]}
      >
        {isOpen && <CreateFacturaSheet isOpen={true} onClose={closeModal} />}
      </PermissionGuard>

      {/* Dialog de importación */}

      <PermissionGuard
        permissions={[
          PermissionActions.facturas.crear,
          PermissionActions.facturas.gestionar,
        ]}
      >
        <ImportFacturasDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
        />
      </PermissionGuard>
    </div>
  );
}
