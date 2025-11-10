import { LucideIcon } from "lucide-react";

export interface ColaboradorAction {
  id: string;
  label: string;
  variant?: "default" | "destructive";
  icon?: LucideIcon;
  onClick: () => void;
}

export const CreateColaboradorActions = (
  onEdit: () => void,
  onDelete: () => void
): ColaboradorAction[] => {
  const actions: ColaboradorAction[] = [
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
