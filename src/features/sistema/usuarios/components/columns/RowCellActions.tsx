"use client";
import { Row } from "@tanstack/react-table";
import { UserDto } from "../../server/dtos/UserDto.dto";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { UserActionsDropdown } from "./UserActionsDropdown";
import { createUserActions } from "./userActions.config";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { useDeleteUser } from "../../hooks/useDeleteUser.hook";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

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

const DeleteUserAlertDialog = dynamic(
  () =>
    import("../DeleteUserAlertDialog").then((mod) => ({
      default: mod.DeleteUserAlertDialog,
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

  const deleteUserMutation = useDeleteUser();

  const handleDelete = () => {
    deleteUserMutation.mutate(row.original.id, {
      onSuccess: () => {
        closeDeleteModal();
        showToast({
          title: "Usuario eliminado",
          description: "El usuario fue eliminado exitosamente.",
          type: "success",
        });
      },
      onError: () => {
        showToast({
          title: "Error",
          description:
            deleteUserMutation.error?.message ||
            "No se pudo eliminar el usuario. Por favor, intenta nuevamente.",
          type: "error",
        });
      },
    });
  };

  const actions = createUserActions(openModal, openDeleteModal);

  return (
    <>
      <UserActionsDropdown actions={actions} />

      <PermissionGuard
        permissions={[
          PermissionActions.usuarios.eliminar,
          PermissionActions.usuarios.gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteUserAlertDialog
            isOpen={isDeleteOpen}
            onOpenChange={closeDeleteModal}
            onConfirmDelete={handleDelete}
            userNameToDelete={row.original.name}
            isLoading={deleteUserMutation.isPending}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions.usuarios.editar,
          PermissionActions.usuarios.gestionar,
        ]}
      >
        {isOpen && (
          <EditUserSheet
            isOpen={true}
            onClose={closeModal}
            mode="add"
            userId={row.original.id}
          />
        )}
      </PermissionGuard>
    </>
  );
}
