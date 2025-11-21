export const createIngresoActions = (
  onEdit: () => void,
  onDelete: () => void,
  onCopyUuId: () => void,
  onShowHistory: () => void
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
    id: "copyId",
    label: "Copiar UUID",
    onClick: onCopyUuId,
  },
  {
    id: "history",
    label: "Historial",
    onClick: onShowHistory,
  },
];
