import { LucideIcon } from "lucide-react";

export interface RoleAction {
  id: string;
  label: string;
  variant?: "default" | "destructive";
  icon?: LucideIcon;
  onClick: () => void;
}

export const createRoleActions = (
  onEdit: () => void,
  onDelete: () => void
): RoleAction[] => {
  const actions: RoleAction[] = [
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

