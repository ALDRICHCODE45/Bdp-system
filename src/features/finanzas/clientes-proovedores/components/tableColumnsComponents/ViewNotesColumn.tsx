import { Row } from "@tanstack/react-table";
import { ClienteProveedorDto } from "../../server/dtos/ClienteProveedorDto.dto";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/core/shared/ui/popover";
import { NotebookPen } from "lucide-react";
import { Button } from "@/core/shared/ui/button";

export const ViewNotesColumn = ({
  column,
}: {
  column: Row<ClienteProveedorDto>;
}) => {
  const notes = column.original.notas;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
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
