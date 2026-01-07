"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { IngresoDto } from "../../server/dtos/IngresoDto.dto";
import { useDeleteIngreso } from "../../hooks/useDeleteIngreso.hook";
import { createIngresoActions } from "./IngresoActions.config";
import { useCopyToClipboard } from "@/core/shared/hooks/use-copy-to-clipboard";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const EditIngresoSheet = dynamic(
  () =>
    import("../EditIngresoSheet").then((mod) => ({
      default: mod.EditIngresoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteIngresoAlertDialog = dynamic(
  () =>
    import("../DeleteIngresoAlertDialog").then((mod) => ({
      default: mod.DeleteIngresoAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const IngresoHistorySheet = dynamic(
  () =>
    import("../IngresoHistorySheet").then((mod) => ({
      default: mod.IngresoHistorySheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function IngresoRowActions({ row }: { row: Row<IngresoDto> }) {
  const ingreso = row.original;
  const { copyToClipboard, copied } = useCopyToClipboard();
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();
  const {
    isOpen: isHistoryOpen,
    openModal: openHistory,
    closeModal: closeHistory,
  } = useModalState();

  const deleteIngresoMutation = useDeleteIngreso();

  const handleDelete = async () => {
    await deleteIngresoMutation.mutateAsync(ingreso.id);
    closeDeleteModal();
  };

  const handleCopyUUID = () => {
    copyToClipboard(ingreso.id);
    showToast({
      description: "UUID copiado correctamente",
      title: "Operacion Exitosa",
      type: "info",
    });
  };

  const actions = createIngresoActions(
    openModal,
    openDeleteModal,
    handleCopyUUID,
    openHistory
  );

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      <PermissionGuard
        permissions={[
          PermissionActions.ingresos.eliminar,
          PermissionActions.ingresos.gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteIngresoAlertDialog
            isOpen={isDeleteOpen}
            onOpenChange={closeDeleteModal}
            onConfirmDelete={handleDelete}
            ingresoToDelete={ingreso.concepto}
            isLoading={deleteIngresoMutation.isPending}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions.ingresos.editar,
          PermissionActions.ingresos.gestionar,
        ]}
      >
        {isOpen && (
          <EditIngresoSheet
            ingreso={ingreso}
            isOpen={true}
            onClose={closeModal}
          />
        )}
      </PermissionGuard>

      {isHistoryOpen && (
        <IngresoHistorySheet
          isOpen={true}
          onClose={closeHistory}
          ingresoConcepto={ingreso.concepto}
          ingresoId={ingreso.id}
        />
      )}
    </>
  );
}
