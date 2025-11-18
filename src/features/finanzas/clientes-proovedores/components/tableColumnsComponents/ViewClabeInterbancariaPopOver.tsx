import { Row } from "@tanstack/react-table";
import { ClienteProveedorDto } from "../../server/dtos/ClienteProveedorDto.dto";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/core/shared/ui/popover";
import { BanknoteArrowUp, NotebookPen } from "lucide-react";
import { Button } from "@/core/shared/ui/button";

export const ViewClabeInterbancariaPopOver = ({
  column,
}: {
  column: Row<ClienteProveedorDto>;
}) => {
  const clabe = column.original.clabe;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <BanknoteArrowUp className="text-gray-700 dark:text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm text-gray-700 dark:text-white max-w-lg">
          {clabe}
        </p>
      </PopoverContent>
    </Popover>
  );
};
