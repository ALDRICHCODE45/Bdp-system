import { Pencil, Trash } from "lucide-react";

export const createEgresoActions = (
  onEdit: () => void,
  onDelete: () => void
) => [
  {
    id: "edit",
    label: "Editar",
    icon: Pencil,
    onClick: onEdit,
  },
  {
    id: "delete",
    label: "Eliminar",
    icon: Trash,
    onClick: onDelete,
    variant: "destructive" as const,
  },
];

