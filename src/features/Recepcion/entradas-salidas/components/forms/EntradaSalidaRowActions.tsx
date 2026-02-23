"use client";
import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { EntradasSalidasDTO } from "../../server/dtos/EntradasSalidasDto.dto";
import { useDeleteEntradaSalida } from "../../hooks/useDeleteEntradaSalida.hook";
import { useRegistrarSalida } from "../../hooks/useRegistrarSalida.hook";
import { EntradaSalidaActionsDropdown } from "../EntradaSalidaActionsDropdown";
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
  },
);

const DeleteEntradaSalidaAlertDialog = dynamic(
  () =>
    import("../DeleteEntradaSalidaAlertDialog").then((mod) => ({
      default: mod.DeleteEntradaSalidaAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

const RegistrarSalidaDialog = dynamic(
  () =>
    import("../RegistrarSalidaDialog").then((mod) => ({
      default: mod.RegistrarSalidaDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

type ModalAction = "edit" | "delete" | "registrarSalida" | null;

export function EntradaSalidaRowActions({
  row,
}: {
  row: Row<EntradasSalidasDTO>;
}) {
  const entradaSalida = row.original;
  const [activeAction, setActiveAction] = useState<ModalAction>(null);

  const deleteEntradaSalidaMutation = useDeleteEntradaSalida();
  const registrarSalidaMutation = useRegistrarSalida();

  const closeAction = () => setActiveAction(null);

  const handleDelete = async () => {
    await deleteEntradaSalidaMutation.mutateAsync(entradaSalida.id);
    closeAction();
  };

  const handleRegistrarSalida = async (horaSalidaISO: string) => {
    const formData = new FormData();
    formData.append("id", entradaSalida.id);
    formData.append("hora_salida", horaSalidaISO);
    await registrarSalidaMutation.mutateAsync(formData);
    closeAction();
  };

  const hasHoraSalida = !!entradaSalida.hora_salida;

  const actions = CreateEntradaSalidaActions(
    () => setActiveAction("edit"),
    () => setActiveAction("delete"),
    () => setActiveAction("registrarSalida"),
    hasHoraSalida,
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
        {activeAction === "delete" && (
          <DeleteEntradaSalidaAlertDialog
            isOpen={true}
            onOpenChange={closeAction}
            onConfirmDelete={handleDelete}
            entradaSalidaToDelete={entradaSalida.visitante}
            isLoading={deleteEntradaSalidaMutation.isPending}
          />
        )}
      </PermissionGuard>

      {activeAction === "registrarSalida" && (
        <RegistrarSalidaDialog
          isOpen={true}
          onOpenChange={closeAction}
          entradaSalida={entradaSalida}
          onConfirm={handleRegistrarSalida}
          isLoading={registrarSalidaMutation.isPending}
        />
      )}

      <PermissionGuard
        permissions={[
          PermissionActions.recepcion.editar,
          PermissionActions.recepcion.gestionar,
        ]}
      >
        {activeAction === "edit" && (
          <EditEntradaSalidaSheet
            entradaSalida={entradaSalida}
            isOpen={true}
            onClose={closeAction}
          />
        )}
      </PermissionGuard>
    </>
  );
}
