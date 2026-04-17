"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import type { ClienteJuridicoDto } from "../server/dtos/ClienteJuridicoDto.dto";
import { useDeleteClienteJuridico } from "../hooks/useDeleteClienteJuridico.hook";
import { Pencil, Trash2 } from "lucide-react";
import type { ColaboradorAction } from "@/features/RecursosHumanos/colaboradores/components/forms/ColaboradorActions.config";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const EditClienteJuridicoSheet = dynamic(
  () =>
    import("./EditClienteJuridicoSheet").then((mod) => ({
      default: mod.EditClienteJuridicoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteClienteJuridicoAlertDialog = dynamic(
  () =>
    import("./DeleteClienteJuridicoAlertDialog").then((mod) => ({
      default: mod.DeleteClienteJuridicoAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function ClienteJuridicoRowActions({
  row,
}: {
  row: Row<ClienteJuridicoDto>;
}) {
  const cliente = row.original;

  const {
    isOpen: isEditOpen,
    openModal: openEdit,
    closeModal: closeEdit,
  } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDelete,
    closeModal: closeDelete,
  } = useModalState();

  const deleteMutation = useDeleteClienteJuridico();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(cliente.id);
    closeDelete();
  };

  const actions: ColaboradorAction[] = [
    {
      id: "edit",
      label: "Editar",
      icon: Pencil,
      onClick: openEdit,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: Trash2,
      variant: "destructive",
      onClick: openDelete,
    },
  ];

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-clientes"].editar,
          PermissionActions["juridico-clientes"].gestionar,
        ]}
      >
        {isEditOpen && (
          <EditClienteJuridicoSheet
            cliente={cliente}
            isOpen={true}
            onClose={closeEdit}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-clientes"].eliminar,
          PermissionActions["juridico-clientes"].gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteClienteJuridicoAlertDialog
            isOpen={isDeleteOpen}
            onOpenChange={closeDelete}
            onConfirmDelete={handleDelete}
            clienteNombre={cliente.nombre}
            isLoading={deleteMutation.isPending}
          />
        )}
      </PermissionGuard>
    </>
  );
}
