"use client";

import { useState } from "react";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { columns } from "../components/FacturasTableColumns";
import { FacturasTableConfig } from "../components/FacturasTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { ImportFacturasDialog } from "../components/import";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

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

interface FacturasTablePageProps {
  tableData: FacturaDto[];
}

export function FacturasTablePage({ tableData }: FacturasTablePageProps) {
  const { isOpen, openModal, closeModal } = useModalState();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleAdd = () => {
    openModal();
  };

  const handleImport = () => {
    setImportDialogOpen(true);
  };

  // Crear configuración con handlers
  const tableConfig = createTableConfig(FacturasTableConfig, {
    onAdd: handleAdd,
    onImport: handleImport,
  });

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra y gestiona las facturas de tu empresa"
        title="Gestion de Facturas"
      />
      <PermissionGuard
        permissions={[
          PermissionActions.facturas.ver,
          PermissionActions.facturas.gestionar,
        ]}
      >
        <DataTable columns={columns} data={tableData} config={tableConfig} />
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
