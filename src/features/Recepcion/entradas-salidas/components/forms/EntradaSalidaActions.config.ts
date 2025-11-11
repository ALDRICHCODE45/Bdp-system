import { LucideIcon, LogOut } from "lucide-react";

export interface EntradaSalidaAction {
  id: string;
  label: string;
  variant?: "default" | "destructive";
  icon?: LucideIcon;
  onClick: () => void;
}

export const CreateEntradaSalidaActions = (
  onEdit: () => void,
  onDelete: () => void,
  onRegistrarSalida?: () => void,
  hasHoraSalida?: boolean
): EntradaSalidaAction[] => {
  const actions: EntradaSalidaAction[] = [];

  // Solo mostrar "Registrar Salida" si no tiene hora_salida y la función está disponible
  if (onRegistrarSalida && !hasHoraSalida) {
    actions.push({
      id: "registrar-salida",
      label: "Registrar Salida",
      icon: LogOut,
      onClick: onRegistrarSalida,
    });
  }

  actions.push(
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
    }
  );

  return actions;
};

