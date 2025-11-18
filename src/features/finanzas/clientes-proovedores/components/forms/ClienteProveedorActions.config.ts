export const createClienteProveedorActions = (
  onEdit: () => void,
  onDelete: () => void
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
];
