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
  onDelete: () => void,
  onShowHistory: () => void,
  onClickProfile: () => void,
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
    {
      id: "history",
      label: "Historial",
      onClick: onShowHistory,
    },
    {
      id: "profile",
      label: "Perfil",
      variant: "default",
      onClick: onClickProfile,
    },
  ];

  return actions;
};
