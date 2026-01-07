"use client";
import { Row } from "@tanstack/react-table";
import { EntradasSalidasDTO } from "../../server/dtos/EntradasSalidasDto.dto";
import { useDeleteEntradaSalida } from "../../hooks/useDeleteEntradaSalida.hook";
import { useRegistrarSalida } from "../../hooks/useRegistrarSalida.hook";
import { EntradaSalidaActionsDropdown } from "../EntradaSalidaActionsDropdown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { CreateEntradaSalidaActions } from "./EntradaSalidaActions.config";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const EditEntradaSalidaSheet = dynamic(
  () =>
    import("../EditEntradaSalidaSheet").then((mod) => ({
      default: mod.EditEntradaSalidaSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteEntradaSalidaAlertDialog = dynamic(
  () =>
    import("../DeleteEntradaSalidaAlertDialog").then((mod) => ({
      default: mod.DeleteEntradaSalidaAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const RegistrarSalidaDialog = dynamic(
  () =>
    import("../RegistrarSalidaDialog").then((mod) => ({
      default: mod.RegistrarSalidaDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function EntradaSalidaRowActions({
  row,
}: {
  row: Row<EntradasSalidasDTO>;
}) {
  const entradaSalida = row.original;
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();
  const {
    isOpen: isRegistrarSalidaOpen,
    openModal: openRegistrarSalidaModal,
    closeModal: closeRegistrarSalidaModal,
  } = useModalState();

  const deleteEntradaSalidaMutation = useDeleteEntradaSalida();
  const registrarSalidaMutation = useRegistrarSalida();

  const handleDelete = async () => {
    await deleteEntradaSalidaMutation.mutateAsync(entradaSalida.id);
    closeDeleteModal();
  };

  const handleRegistrarSalida = async (horaSalidaISO: string) => {
    const formData = new FormData();
    formData.append("id", entradaSalida.id);
    formData.append("hora_salida", horaSalidaISO);
    await registrarSalidaMutation.mutateAsync(formData);
    closeRegistrarSalidaModal();
  };

  const hasHoraSalida = !!entradaSalida.hora_salida;

  const actions = CreateEntradaSalidaActions(
    openModal,
    openDeleteModal,
    openRegistrarSalidaModal,
    hasHoraSalida
  );

  return (
    <>
      <EntradaSalidaActionsDropdown actions={actions} />

      <PermissionGuard
        permissions={[
          PermissionActions.recepcion.eliminar,
          PermissionActions.recepcion.gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteEntradaSalidaAlertDialog
            isOpen={isDeleteOpen}
            onOpenChange={closeDeleteModal}
            onConfirmDelete={handleDelete}
            entradaSalidaToDelete={entradaSalida.visitante}
            isLoading={deleteEntradaSalidaMutation.isPending}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions.recepcion.editar,
          PermissionActions.recepcion.gestionar,
        ]}
      >
        {isRegistrarSalidaOpen && (
          <RegistrarSalidaDialog
            isOpen={isRegistrarSalidaOpen}
            onOpenChange={closeRegistrarSalidaModal}
            entradaSalida={entradaSalida}
            onConfirm={handleRegistrarSalida}
            isLoading={registrarSalidaMutation.isPending}
          />
        )}

        {isOpen && (
          <EditEntradaSalidaSheet
            entradaSalida={entradaSalida}
            isOpen={true}
            onClose={closeModal}
          />
        )}
      </PermissionGuard>
    </>
  );
}
