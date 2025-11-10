"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorDto } from "../../server/dtos/ColaboradorDto.dto";
import { useDeleteColaborador } from "../../hooks/useDeleteColaborador.hook";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { CreateColaboradorActions } from "./ColaboradorActions.config";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";

const EditColaboradorSheet = dynamic(
  () =>
    import("../EditColaboradorSheet").then((mod) => ({
      default: mod.EditColaboradorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteColaboradorAlertDialog = dynamic(
  () =>
    import("../DeleteColaboradorAlertDialog").then((mod) => ({
      default: mod.DeleteColaboradorAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function RhRowActions({ row }: { row: Row<ColaboradorDto> }) {
  const colaborador = row.original;
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();

  const deleteColaboradorMutation = useDeleteColaborador();

  const handleDelete = async () => {
    await deleteColaboradorMutation.mutateAsync(colaborador.id);
  };

  const actions = CreateColaboradorActions(openModal, openDeleteModal);

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      {isDeleteOpen && (
        <DeleteColaboradorAlertDialog
          isOpen={isDeleteOpen}
          onOpenChange={closeDeleteModal}
          onConfirmDelete={handleDelete}
          colaboradorToDelete={colaborador.name}
          isLoading={deleteColaboradorMutation.isPending}
        />
      )}

      {isOpen && (
        <EditColaboradorSheet
          colaborador={colaborador}
          isOpen={true}
          onClose={closeModal}
        />
      )}
    </>
  );
}
