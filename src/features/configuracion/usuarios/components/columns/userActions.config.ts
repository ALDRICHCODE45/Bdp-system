export interface UserAction {
  id: string;
  label: string;
  variant?: "default" | "destructive";
  onClick: () => void;
}

export const createUserActions = (
  onEdit: () => void,
  onViewDetails?: () => void,
  onDelete?: () => void
): UserAction[] => {
  const actions: UserAction[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: onEdit,
    },
  ];

  if (onViewDetails) {
    actions.push({
      id: "view-details",
      label: "Ver detalles",
      onClick: onViewDetails,
    });
  }

  if (onDelete) {
    actions.push({
      id: "delete",
      label: "Eliminar",
      variant: "destructive",
      onClick: onDelete,
    });
  }

  return actions;
};

