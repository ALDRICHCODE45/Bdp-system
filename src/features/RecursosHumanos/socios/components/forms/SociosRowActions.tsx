"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { SocioDto } from "../../server/dtos/SocioDto.dto";
import { useDeleteSocio } from "../../hooks/useDeleteSocio.hook";
import { createSocioActions } from "./SocioActions.config";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const EditSocioSheet = dynamic(
  () =>
    import("../EditSocioSheet").then((mod) => ({
      default: mod.EditSocioSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteSocioAlertDialog = dynamic(
  () =>
    import("../DeleteSocioAlertDialog").then((mod) => ({
      default: mod.DeleteSocioAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function SociosRowActions({ row }: { row: Row<SocioDto> }) {
  const socio = row.original;
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();

  const deleteSocioMutation = useDeleteSocio();

  const handleDelete = async () => {
    await deleteSocioMutation.mutateAsync(socio.id);
  };

  const actions = createSocioActions(openModal, openDeleteModal);

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      <PermissionGuard
        permissions={[
          PermissionActions.socios.eliminar,
          PermissionActions.socios.gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteSocioAlertDialog
            isOpen={isDeleteOpen}
            onOpenChange={closeDeleteModal}
            onConfirmDelete={handleDelete}
            socioToDelete={socio.nombre}
            isLoading={deleteSocioMutation.isPending}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions.socios.editar,
          PermissionActions.socios.gestionar,
        ]}
      >
        {isOpen && (
          <EditSocioSheet socio={socio} isOpen={true} onClose={closeModal} />
        )}
      </PermissionGuard>
    </>
  );
}
