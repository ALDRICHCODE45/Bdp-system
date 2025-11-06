"use client";

import { Row } from "@tanstack/react-table";
import { RoleDto } from "../../types/RoleDto.dto";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { RoleActionsDropdown } from "./RoleActionsDropdown";
import { createRoleActions } from "./roleActions.config";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { useDeleteRole } from "../../hooks/useDeleteRole.hook";
import { useRouter } from "next/navigation";

const EditRoleSheet = dynamic(
  () =>
    import("../EditRoleSheet").then((mod) => ({
      default: mod.EditRoleSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteRoleAlertDialog = dynamic(
  () =>
    import("../DeleteRoleAlertDialog").then((mod) => ({
      default: mod.DeleteRoleAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const AssignPermissionsSheet = dynamic(
  () =>
    import("../AssignPermissionsSheet").then((mod) => ({
      default: mod.AssignPermissionsSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function RowCellActions({ row }: { row: Row<RoleDto> }) {
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();
  const {
    isOpen: isPermissionsOpen,
    openModal: openPermissionsModal,
    closeModal: closePermissionsModal,
  } = useModalState();

  const deleteRoleMutation = useDeleteRole();

  const handleDelete = () => {
    deleteRoleMutation.mutate(row.original.id, {
      onSuccess: () => {
        closeDeleteModal();
        showToast({
          title: "Rol eliminado",
          description: "El rol fue eliminado exitosamente.",
          type: "success",
        });
        router.refresh();
      },
      onError: (error) => {
        showToast({
          title: "Error",
          description:
            error.message ||
            "No se pudo eliminar el rol. Por favor, intenta nuevamente.",
          type: "error",
        });
      },
    });
  };

  const actions = createRoleActions(openModal, openDeleteModal, openPermissionsModal);

  return (
    <>
      <RoleActionsDropdown actions={actions} />

      {isDeleteOpen && (
        <DeleteRoleAlertDialog
          isOpen={isDeleteOpen}
          onOpenChange={closeDeleteModal}
          onConfirmDelete={handleDelete}
          roleNameToDelete={row.original.name}
          isLoading={deleteRoleMutation.isPending}
        />
      )}

      {isOpen && (
        <EditRoleSheet
          isOpen={true}
          onClose={closeModal}
          mode="edit"
          roleId={row.original.id}
        />
      )}

      {isPermissionsOpen && (
        <AssignPermissionsSheet
          isOpen={isPermissionsOpen}
          onClose={closePermissionsModal}
          roleId={row.original.id}
          roleName={row.original.name}
        />
      )}
    </>
  );
}

