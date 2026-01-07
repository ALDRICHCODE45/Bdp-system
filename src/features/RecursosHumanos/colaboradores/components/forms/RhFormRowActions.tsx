"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorDto } from "../../server/dtos/ColaboradorDto.dto";
import { useDeleteColaborador } from "../../hooks/useDeleteColaborador.hook";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { CreateColaboradorActions } from "./ColaboradorActions.config";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useRouter } from "next/navigation";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const EditColaboradorSheet = dynamic(
  () =>
    import("../EditColaboradorSheet").then((mod) => ({
      default: mod.EditColaboradorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

const DeleteColaboradorAlertDialog = dynamic(
  () =>
    import("../DeleteColaboradorAlertDialog").then((mod) => ({
      default: mod.DeleteColaboradorAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

const ColaboradorHistorySheet = dynamic(
  () =>
    import("../ColaboradorHistorySheet").then((mod) => ({
      default: mod.ColaboradorHistorySheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

export function RhRowActions({ row }: { row: Row<ColaboradorDto> }) {
  const router = useRouter();
  const colaborador = row.original;
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();

  const {
    isOpen: isHistoryOpen,
    openModal: OpenHistory,
    closeModal: closeHistory,
  } = useModalState();

  const deleteColaboradorMutation = useDeleteColaborador();

  const handleDelete = async () => {
    await deleteColaboradorMutation.mutateAsync(colaborador.id);
  };

  const navigateToColaboradorProfile = () => {
    router.push(`/colaboradores/${row.original.id}`);
  };

  const actions = CreateColaboradorActions(
    openModal,
    openDeleteModal,
    OpenHistory,
    navigateToColaboradorProfile,
  );

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      <PermissionGuard
        permissions={[
          PermissionActions.colaboradores.eliminar,
          PermissionActions.colaboradores.gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteColaboradorAlertDialog
            isOpen={isDeleteOpen}
            onOpenChange={closeDeleteModal}
            onConfirmDelete={handleDelete}
            colaboradorToDelete={colaborador.name}
            isLoading={deleteColaboradorMutation.isPending}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions.colaboradores.editar,
          PermissionActions.colaboradores.gestionar,
        ]}
      >
        {isOpen && (
          <EditColaboradorSheet
            colaborador={colaborador}
            isOpen={true}
            onClose={closeModal}
          />
        )}
      </PermissionGuard>

      {isHistoryOpen && (
        <ColaboradorHistorySheet
          isOpen={true}
          onClose={closeHistory}
          colaboradorName={colaborador.name}
          colaboradorId={colaborador.id}
        />
      )}
    </>
  );
}
