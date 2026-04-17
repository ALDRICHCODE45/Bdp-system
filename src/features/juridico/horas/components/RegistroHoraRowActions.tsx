"use client";
import { Row } from "@tanstack/react-table";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import type { RegistroHoraDto } from "../server/dtos/RegistroHoraDto.dto";
import { useDeleteRegistroHora } from "../hooks/useDeleteRegistroHora.hook";
import { Pencil, Trash2, History, FilePenLine } from "lucide-react";
import type { ColaboradorAction } from "@/features/RecursosHumanos/colaboradores/components/forms/ColaboradorActions.config";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { isWithinDeadline } from "@/core/shared/helpers/weekUtils";

const EditRegistroHoraSheet = dynamic(
  () =>
    import("./EditRegistroHoraSheet").then((mod) => ({
      default: mod.EditRegistroHoraSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const RegistroHoraHistorialSheet = dynamic(
  () =>
    import("./RegistroHoraHistorialSheet").then((mod) => ({
      default: mod.RegistroHoraHistorialSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const SolicitarEdicionDialog = dynamic(
  () =>
    import("./SolicitarEdicionDialog").then((mod) => ({
      default: mod.SolicitarEdicionDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export function RegistroHoraRowActions({
  row,
}: {
  row: Row<RegistroHoraDto>;
}) {
  const registro = row.original;

  const {
    isOpen: isEditOpen,
    openModal: openEdit,
    closeModal: closeEdit,
  } = useModalState();
  const {
    isOpen: isHistorialOpen,
    openModal: openHistorial,
    closeModal: closeHistorial,
  } = useModalState();
  const {
    isOpen: isSolicitarOpen,
    openModal: openSolicitar,
    closeModal: closeSolicitar,
  } = useModalState();

  const deleteMutation = useDeleteRegistroHora();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(registro.id);
  };

  // Show "Solicitar Edición" when: editable=false AND deadline has passed
  const isDeadlinePassed = !isWithinDeadline(registro.ano, registro.semana);
  const showSolicitar = !registro.editable && isDeadlinePassed;

  const actions: ColaboradorAction[] = [
    ...(registro.editable
      ? [
          {
            id: "edit",
            label: "Editar",
            icon: Pencil,
            onClick: openEdit,
          } as ColaboradorAction,
        ]
      : []),
    ...(showSolicitar
      ? [
          {
            id: "solicitar-edicion",
            label: "Solicitar Edición",
            icon: FilePenLine,
            onClick: openSolicitar,
          } as ColaboradorAction,
        ]
      : []),
    {
      id: "historial",
      label: "Ver historial",
      icon: History,
      onClick: openHistorial,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: Trash2,
      variant: "destructive" as const,
      onClick: handleDelete,
    },
  ];

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-horas"].registrar,
          PermissionActions["juridico-horas"].gestionar,
        ]}
      >
        {isEditOpen && (
          <EditRegistroHoraSheet
            registro={registro}
            isOpen={true}
            onClose={closeEdit}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-horas"]["solicitar-edicion"],
          PermissionActions["juridico-horas"].gestionar,
        ]}
      >
        {isSolicitarOpen && (
          <SolicitarEdicionDialog
            registroHoraId={registro.id}
            semana={registro.semana}
            ano={registro.ano}
            isOpen={true}
            onClose={closeSolicitar}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[PermissionActions["juridico-horas"].acceder]}
      >
        {isHistorialOpen && (
          <RegistroHoraHistorialSheet
            registroHoraId={registro.id}
            isOpen={true}
            onClose={closeHistorial}
          />
        )}
      </PermissionGuard>
    </>
  );
}
