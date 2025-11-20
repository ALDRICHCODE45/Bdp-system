export const createEgresoActions = (
  onEdit: () => void,
  onDelete: () => void,
  onCopyUUID: () => void
) => [
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
    id: "copyUUID",
    label: "Copiar UUID",
    onClick: onCopyUUID,
  },
];
