"use client";
import { Row } from "@tanstack/react-table";
import { UserDto } from "../../server/dtos/UserDto.dto";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useEditUserModal } from "../../hooks/useEditUserModal.hook";
import { UserActionsDropdown } from "./UserActionsDropdown";
import { createUserActions } from "./userActions.config";

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
  const {
    isEditUserModalOpen,
    editModalType,
    handleOpenEditModal,
    closeEditModal,
  } = useEditUserModal();

  const handleDelete = () => {
    // TODO: Implementar eliminación
    console.log("Eliminar Usuario");
  };

  const actions = createUserActions(handleOpenEditModal, handleDelete);

  return (
    <>
      <UserActionsDropdown actions={actions} />

      {isEditUserModalOpen && editModalType === "add" && (
        <EditUserSheet
          isOpen={true}
          onClose={closeEditModal}
          mode="add"
          userId={row.original.id}
        />
      )}
    </>
  );
}
