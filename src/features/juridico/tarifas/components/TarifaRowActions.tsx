"use client";
import { useState } from "react";
import { Pencil, History, XCircle } from "lucide-react";
import { ColaboradorActionsDropdown } from "@/features/sistema/usuarios/components/columns/ColaboradorActionsDropDown";
import type { ColaboradorAction } from "@/features/RecursosHumanos/colaboradores/components/forms/ColaboradorActions.config";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { useDeactivateTarifa } from "../hooks/useDeactivateTarifa.hook";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import type { TarifaAbogadoAsuntoDto } from "../server/dtos/TarifaAbogadoAsuntoDto.dto";

const EditTarifaSheet = dynamic(
  () =>
    import("./EditTarifaSheet").then((mod) => ({
      default: mod.EditTarifaSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> },
);

const DeactivateTarifaAlertDialog = dynamic(
  () =>
    import("./DeactivateTarifaAlertDialog").then((mod) => ({
      default: mod.DeactivateTarifaAlertDialog,
    })),
  { ssr: false, loading: () => <LoadingModalState /> },
);

const TarifaHistorialSheet = dynamic(
  () =>
    import("./TarifaHistorialSheet").then((mod) => ({
      default: mod.TarifaHistorialSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> },
);

interface TarifaRowActionsProps {
  tarifa: TarifaAbogadoAsuntoDto;
}

export function TarifaRowActions({ tarifa }: TarifaRowActionsProps) {
  const {
    isOpen: isEditOpen,
    openModal: openEdit,
    closeModal: closeEdit,
  } = useModalState();
  const {
    isOpen: isDeactivateOpen,
    openModal: openDeactivate,
    closeModal: closeDeactivate,
  } = useModalState();
  const [historialTarifa, setHistorialTarifa] =
    useState<TarifaAbogadoAsuntoDto | null>(null);

  const deactivateMutation = useDeactivateTarifa();

  const handleDeactivate = async () => {
    await deactivateMutation.mutateAsync(tarifa.id);
    closeDeactivate();
  };

  const actions: ColaboradorAction[] = [
    {
      id: "edit",
      label: "Editar tarifa",
      icon: Pencil,
      onClick: openEdit,
    },
    {
      id: "history",
      label: "Ver historial",
      icon: History,
      onClick: () => setHistorialTarifa(tarifa),
    },
  ];

  if (tarifa.activa) {
    actions.push({
      id: "deactivate",
      label: "Desactivar",
      icon: XCircle,
      variant: "destructive",
      onClick: openDeactivate,
    });
  }

  return (
    <>
      <ColaboradorActionsDropdown actions={actions} />

      <PermissionGuard
        permissions={[PermissionActions["juridico-tarifas"].gestionar]}
      >
        {isEditOpen && (
          <EditTarifaSheet tarifa={tarifa} isOpen={true} onClose={closeEdit} />
        )}
        {isDeactivateOpen && (
          <DeactivateTarifaAlertDialog
            isOpen={isDeactivateOpen}
            onOpenChange={closeDeactivate}
            onConfirm={handleDeactivate}
            tarifaLabel={`${tarifa.usuarioNombre} · ${tarifa.asuntoJuridicoNombre}`}
            isLoading={deactivateMutation.isPending}
          />
        )}
        {historialTarifa && (
          <TarifaHistorialSheet
            tarifa={historialTarifa}
            isOpen={!!historialTarifa}
            onClose={() => setHistorialTarifa(null)}
          />
        )}
      </PermissionGuard>
    </>
  );
}
