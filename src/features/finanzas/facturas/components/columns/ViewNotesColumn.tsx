import { Row } from "@tanstack/react-table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/core/shared/ui/popover";
import { NotebookPen } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import { FacturaDto } from "../../server/dtos/FacturaDto.dto";

export const ViewNotesColumn = ({ column }: { column: Row<FacturaDto> }) => {
  const notes = column.original.notas;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={"icon"}
          buttonTooltip
          buttonTooltipText="Visualiza tus notas"
        >
          <NotebookPen className="text-gray-700 dark:text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm text-gray-700 dark:text-white max-w-lg">
          {notes}
        </p>
      </PopoverContent>
    </Popover>
  );
};
