import { Button } from "@/core/shared/ui/button";
import { LucideIcon, RefreshCw } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { ExportButton } from "./ExportButton";

interface FilterHeaderActions {
  showAddButton?: boolean;
  AddButtonIcon?: LucideIcon;
  addButtonText: string;
  onClearFilters: () => void;
  buttonTooltipText: string;
  onAdd?: () => void;
  onExport?: (table: Table<unknown>) => void;
  table?: Table<unknown>;
  exportFileName?: string;
}

export const FilterHeaderActions = ({
  AddButtonIcon,
  addButtonText: _addButtonText,
  onClearFilters,
  showAddButton = false,
  buttonTooltipText,
  onAdd,
  onExport,
  table,
  exportFileName,
}: FilterHeaderActions) => {
  return (
    <>
      {showAddButton && (
        <Button
          buttonTooltip
          buttonTooltipText={buttonTooltipText}
          variant="default"
          size="icon"
          className="h-8 px-3 flex items-center gap-1"
          onClick={onAdd}
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
      {table && (
        <ExportButton
          table={table}
          onExport={onExport}
          fileName={exportFileName}
        />
      )}
    </>
  );
};
