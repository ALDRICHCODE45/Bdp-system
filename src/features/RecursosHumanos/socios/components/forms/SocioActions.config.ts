import { LucideIcon } from "lucide-react";

export interface SocioAction {
  id: string;
  label: string;
  variant?: "default" | "destructive";
  icon?: LucideIcon;
  onClick: () => void;
}

export const createSocioActions = (
  onEdit: () => void,
  onDelete: () => void
): SocioAction[] => {
  const actions: SocioAction[] = [
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

  return actions;
};
