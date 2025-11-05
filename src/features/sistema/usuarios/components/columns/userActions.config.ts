import { LucideIcon } from "lucide-react";

export interface UserAction {
  id: string;
  label: string;
  variant?: "default" | "destructive";
  icon?: LucideIcon;
  onClick: () => void;
}

export const createUserActions = (
  onEdit: () => void,
  onDelete: () => void,
  onViewDetails?: () => void
): UserAction[] => {
  const actions: UserAction[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: onEdit,
    },
    {
      id: "delete",
      label: "Eliminar",
      variant: "destructive",
      onClick: onDelete,
    },
  ];

  if (onViewDetails) {
    actions.push({
      id: "view-details",
      label: "Ver detalles",
      onClick: onViewDetails,
    });
  }

  return actions;
};
