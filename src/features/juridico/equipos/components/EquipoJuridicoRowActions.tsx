"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import type { EquipoJuridicoDto } from "../server/dtos/EquipoJuridicoDto.dto";
import { useDeleteEquipoJuridico } from "../hooks/useDeleteEquipoJuridico.hook";
import { Eye, Trash2, Users } from "lucide-react";
import type { ColaboradorAction } from "@/features/RecursosHumanos/colaboradores/components/forms/ColaboradorActions.config";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const EditEquipoJuridicoSheet = dynamic(
  () =>
    import("./EditEquipoJuridicoSheet").then((mod) => ({
      default: mod.EditEquipoJuridicoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteEquipoJuridicoAlertDialog = dynamic(
  () =>
    import("./DeleteEquipoJuridicoAlertDialog").then((mod) => ({
      default: mod.DeleteEquipoJuridicoAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface EquipoJuridicoRowActionsProps {
  row: Row<EquipoJuridicoDto>;
  onViewDetail?: (equipo: EquipoJuridicoDto) => void;
}

export function EquipoJuridicoRowActions({
  row,
  onViewDetail,
}: EquipoJuridicoRowActionsProps) {
  const equipo = row.original;

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

  const deleteMutation = useDeleteEquipoJuridico();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(equipo.id);
    closeDelete();
  };

  const actions: ColaboradorAction[] = [
    ...(onViewDetail
      ? [
          {
            id: "view",
            label: "Ver detalles",
            icon: Eye,
            onClick: () => onViewDetail(equipo),
          },
        ]
      : []),
    {
      id: "edit",
      label: "Editar / Miembros",
      icon: Users,
      onClick: openEdit,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: Trash2,
      variant: "destructive" as const,
      onClick: openDelete,
    },
  ];

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-equipos"].editar,
          PermissionActions["juridico-equipos"].gestionar,
        ]}
      >
        {isEditOpen && (
          <EditEquipoJuridicoSheet
            equipo={equipo}
            isOpen={true}
            onClose={closeEdit}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-equipos"].eliminar,
          PermissionActions["juridico-equipos"].gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteEquipoJuridicoAlertDialog
            isOpen={isDeleteOpen}
            onOpenChange={closeDelete}
            onConfirmDelete={handleDelete}
            equipoNombre={equipo.nombre}
            isLoading={deleteMutation.isPending}
          />
        )}
      </PermissionGuard>
    </>
  );
}
