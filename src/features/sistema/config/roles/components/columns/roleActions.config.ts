import { LucideIcon, Shield } from "lucide-react";

export interface RoleAction {
  id: string;
  label: string;
  variant?: "default" | "destructive";
  icon?: LucideIcon;
  onClick: () => void;
}

export const createRoleActions = (
  onEdit: () => void,
  onDelete: () => void,
  onAssignPermissions?: () => void
): RoleAction[] => {
  const actions: RoleAction[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: onEdit,
    },
    ...(onAssignPermissions
      ? [
          {
            id: "permissions",
            label: "Asignar Permisos",
            onClick: onAssignPermissions,
          } as RoleAction,
        ]
      : []),
    {
      id: "delete",
      label: "Eliminar",
      variant: "destructive",
      onClick: onDelete,
    },
  ];

  return actions;
};
