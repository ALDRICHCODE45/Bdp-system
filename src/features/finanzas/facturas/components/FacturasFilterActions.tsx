import { Button } from "@/core/shared/ui/button";
import { Download, LucideIcon, RefreshCw } from "lucide-react";

interface FacturasFilterActionsProps {
  showAddButton?: boolean;
  AddButtonIcon?: LucideIcon;
  addButtonText: string;
  onClearFilters: () => void;
}

export const FacturasFilterActions = ({
  AddButtonIcon,
  addButtonText,
  onClearFilters,
  showAddButton = false,
}: FacturasFilterActionsProps) => {
  return (
    <>
      {showAddButton && (
        <Button
          buttonTooltip
          buttonTooltipText="Agregar factura"
          variant="default"
          size="icon"
          className="h-8 px-3 flex items-center gap-1"
        >
          {AddButtonIcon && <AddButtonIcon className="h-4 w-4" />}
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onClearFilters}
        className="h-8 px-3 flex items-center gap-1"
      >
        <RefreshCw />
        <span>Limpiar</span>
      </Button>
      <Button variant="outline" size="sm" className="h-8 px-3">
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    </>
  );
};
