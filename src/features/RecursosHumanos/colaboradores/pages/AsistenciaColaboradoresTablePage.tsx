"use client";
import { useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { asistenciaColaboradoresColumns } from "../../asistencias/components/AsistenciaColaboradoresColumns";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { AsistenciasTableConfig } from "../../asistencias/components/config/AsistenciasTableConfig";
import { useRouter } from "next/navigation";
import { useAsistencias } from "../../asistencias/hooks/useAsistencias.hook";

export const AsistenciaColaboradoresTablePage = () => {
  const router = useRouter();

  const tableConfig = createTableConfig(AsistenciasTableConfig, {
    onAdd: () => router.push("/register-qr-entry"),
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: tableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isPending, isFetching } = useAsistencias({
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
        subtitle="Administra las asistencias de tus colaboradores"
        title="Gestión de Asistencias"
      />
      <DataTable
        columns={asistenciaColaboradoresColumns}
        data={data?.data ?? []}
        config={serverConfig}
        isLoading={isPending && !isFetching}
      />
    </div>
  );
};
