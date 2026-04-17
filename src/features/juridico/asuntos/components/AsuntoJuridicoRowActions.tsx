"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import type { AsuntoJuridicoDto } from "../server/dtos/AsuntoJuridicoDto.dto";
import { useDeleteAsuntoJuridico } from "../hooks/useDeleteAsuntoJuridico.hook";
import { Pencil, XCircle } from "lucide-react";
import type { ColaboradorAction } from "@/features/RecursosHumanos/colaboradores/components/forms/ColaboradorActions.config";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const EditAsuntoJuridicoSheet = dynamic(
  () =>
    import("./EditAsuntoJuridicoSheet").then((mod) => ({
      default: mod.EditAsuntoJuridicoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteAsuntoJuridicoAlertDialog = dynamic(
  () =>
    import("./DeleteAsuntoJuridicoAlertDialog").then((mod) => ({
      default: mod.DeleteAsuntoJuridicoAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function AsuntoJuridicoRowActions({
  row,
}: {
  row: Row<AsuntoJuridicoDto>;
}) {
  const asunto = row.original;

  const {
    isOpen: isEditOpen,
    openModal: openEdit,
    closeModal: closeEdit,
  } = useModalState();
  const {
    isOpen: isCloseOpen,
    openModal: openClose,
    closeModal: closeClose,
  } = useModalState();

  const deleteMutation = useDeleteAsuntoJuridico();

  const handleClose = async () => {
    await deleteMutation.mutateAsync(asunto.id);
    closeClose();
  };

  const actions: ColaboradorAction[] = [
    {
      id: "edit",
      label: "Editar",
      icon: Pencil,
      onClick: openEdit,
    },
    {
      id: "close",
      label: "Cerrar asunto",
      icon: XCircle,
      variant: "destructive",
      onClick: openClose,
    },
  ];

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-asuntos"].editar,
          PermissionActions["juridico-asuntos"].gestionar,
        ]}
      >
        {isEditOpen && (
          <EditAsuntoJuridicoSheet
            asunto={asunto}
            isOpen={true}
            onClose={closeEdit}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-asuntos"].eliminar,
          PermissionActions["juridico-asuntos"].gestionar,
        ]}
      >
        {isCloseOpen && (
          <DeleteAsuntoJuridicoAlertDialog
            isOpen={isCloseOpen}
            onOpenChange={closeClose}
            onConfirmClose={handleClose}
            asuntoNombre={asunto.nombre}
            isLoading={deleteMutation.isPending}
          />
        )}
      </PermissionGuard>
    </>
  );
}
