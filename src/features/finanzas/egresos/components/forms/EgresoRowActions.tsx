"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { EgresoDto } from "../../server/dtos/EgresoDto.dto";
import { useDeleteEgreso } from "../../hooks/useDeleteEgreso.hook";
import { createEgresoActions } from "./EgresoActions.config";

const EditEgresoSheet = dynamic(
  () =>
    import("../EditEgresoSheet").then((mod) => ({
      default: mod.EditEgresoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteEgresoAlertDialog = dynamic(
  () =>
    import("../DeleteEgresoAlertDialog").then((mod) => ({
      default: mod.DeleteEgresoAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function EgresoRowActions({ row }: { row: Row<EgresoDto> }) {
  const egreso = row.original;
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();

  const deleteEgresoMutation = useDeleteEgreso();

  const handleDelete = async () => {
    await deleteEgresoMutation.mutateAsync(egreso.id);
  };

  const actions = createEgresoActions(openModal, openDeleteModal);

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      {isDeleteOpen && (
        <DeleteEgresoAlertDialog
          isOpen={isDeleteOpen}
          onOpenChange={closeDeleteModal}
          onConfirmDelete={handleDelete}
          egresoToDelete={egreso.concepto}
          isLoading={deleteEgresoMutation.isPending}
        />
      )}

      {isOpen && (
        <EditEgresoSheet egreso={egreso} isOpen={true} onClose={closeModal} />
      )}
    </>
  );
}
