import { Eye } from "lucide-react";
import type { ColaboradorAction } from "@/features/RecursosHumanos/colaboradores/components/forms/ColaboradorActions.config";

export const createClienteProveedorActions = (
  onViewDetails: (() => void) | undefined,
  onEdit: () => void,
  onDelete: () => void,
  onShowHistory: () => void,
): ColaboradorAction[] => {
  const actions: ColaboradorAction[] = [];

  if (onViewDetails) {
    actions.push({
      id: "view",
      label: "Ver detalles",
      icon: Eye,
      onClick: onViewDetails,
    });
  }

  actions.push(
    {
      id: "edit",
      label: "Editar",
      onClick: onEdit,
    },
    {
      id: "delete",
      label: "Eliminar",
      onClick: onDelete,
      variant: "destructive" as const,
    },
    {
      id: "history",
      label: "Historial",
      onClick: onShowHistory,
    },
  );

  return actions;
};
