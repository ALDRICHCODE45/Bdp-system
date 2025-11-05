"use client";
import { Row } from "@tanstack/react-table";
import { UserDto } from "../../server/dtos/UserDto.dto";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { UserActionsDropdown } from "./UserActionsDropdown";
import { createUserActions } from "./userActions.config";
import { DeleteUserAlertDialog } from "../DeleteUserAlertDialog";

const EditUserSheet = dynamic(
  () =>
    import("../EditUserSheet").then((mod) => ({
      default: mod.EditUserSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function RowCellActions({ row }: { row: Row<UserDto> }) {
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();

  const handleDelete = () => {
    // TODO: Implementar eliminación
    console.log("Eliminar Usuario");
  };

  const actions = createUserActions(openModal, openDeleteModal);

  return (
    <>
      <UserActionsDropdown actions={actions} />

      {isDeleteOpen && (
        <DeleteUserAlertDialog
          isOpen={isDeleteOpen}
          onOpenChange={closeDeleteModal}
          onConfirmDelete={handleDelete}
        />
      )}

      {isOpen && (
        <EditUserSheet
          isOpen={true}
          onClose={closeModal}
          mode="add"
          userId={row.original.id}
        />
      )}
    </>
  );
}
