"use client";
import { useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { columns } from "../components/IngresosTableColumns";
import { IngresosTableConfig } from "../components/IngresosTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useIngresos } from "../hooks/useIngresos.hook";

const CreateIngresoSheet = dynamic(
  () =>
    import("../components/CreateIngresoSheet").then((mod) => ({
      default: mod.CreateIngresoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export const IngresosTablePage = () => {
  const { isOpen, openModal, closeModal } = useModalState();

  const tableConfig = createTableConfig(IngresosTableConfig, {
    onAdd: () => openModal(),
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: tableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isPending, isFetching } = useIngresos({
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
        subtitle="Administra y filtra los ingresos de tu empresa"
        title="Gestión de Ingresos"
      />
      <PermissionGuard
        permissions={[
          PermissionActions.ingresos.acceder,
          PermissionActions.ingresos.gestionar,
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
          PermissionActions.ingresos.crear,
          PermissionActions.ingresos.gestionar,
        ]}
      >
        {isOpen && <CreateIngresoSheet isOpen={true} onClose={closeModal} />}
      </PermissionGuard>
    </div>
  );
};
