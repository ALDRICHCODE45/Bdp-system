"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { ClienteProveedorDto } from "../../server/dtos/ClienteProveedorDto.dto";
import { useDeleteClienteProveedor } from "../../hooks/useDeleteClienteProveedor.hook";
import { createClienteProveedorActions } from "./ClienteProveedorActions.config";

const EditClienteProveedorSheet = dynamic(
  () =>
    import("../EditClienteProveedorSheet").then((mod) => ({
      default: mod.EditClienteProveedorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteClienteProveedorAlertDialog = dynamic(
  () =>
    import("../DeleteClienteProveedorAlertDialog").then((mod) => ({
      default: mod.DeleteClienteProveedorAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function ClienteProveedorRowActions({
  row,
}: {
  row: Row<ClienteProveedorDto>;
}) {
  const clienteProveedor = row.original;
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();

  const deleteClienteProveedorMutation = useDeleteClienteProveedor();

  const handleDelete = async () => {
    await deleteClienteProveedorMutation.mutateAsync(clienteProveedor.id);
  };

  const actions = createClienteProveedorActions(openModal, openDeleteModal);

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      {isDeleteOpen && (
        <DeleteClienteProveedorAlertDialog
          isOpen={isDeleteOpen}
          onOpenChange={closeDeleteModal}
          onConfirmDelete={handleDelete}
          clienteProveedorToDelete={clienteProveedor.nombre}
          isLoading={deleteClienteProveedorMutation.isPending}
        />
      )}

      {isOpen && (
        <EditClienteProveedorSheet
          clienteProveedor={clienteProveedor}
          isOpen={true}
          onClose={closeModal}
        />
      )}
    </>
  );
}
