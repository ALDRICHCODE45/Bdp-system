"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { IngresoDto } from "../../server/dtos/IngresoDto.dto";
import { useDeleteIngreso } from "../../hooks/useDeleteIngreso.hook";
import { createIngresoActions } from "./IngresoActions.config";

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

export function IngresoRowActions({ row }: { row: Row<IngresoDto> }) {
  const ingreso = row.original;
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();

  const deleteIngresoMutation = useDeleteIngreso();

  const handleDelete = async () => {
    await deleteIngresoMutation.mutateAsync(ingreso.id);
    closeDeleteModal();
  };

  const actions = createIngresoActions(openModal, openDeleteModal);

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      {isDeleteOpen && (
        <DeleteIngresoAlertDialog
          isOpen={isDeleteOpen}
          onOpenChange={closeDeleteModal}
          onConfirmDelete={handleDelete}
          ingresoToDelete={ingreso.concepto}
          isLoading={deleteIngresoMutation.isPending}
        />
      )}

      {isOpen && (
        <EditIngresoSheet ingreso={ingreso} isOpen={true} onClose={closeModal} />
      )}
    </>
  );
}

