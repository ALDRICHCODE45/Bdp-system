import { Row } from "@tanstack/react-table";
import { ClienteProveedorDto } from "../server/dtos/ClienteProveedorDto.dto";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/core/shared/ui/popover";
import { MapPin } from "lucide-react";
import { Button } from "@/core/shared/ui/button";

export const ViewAddressColumn = ({
  column,
}: {
  column: Row<ClienteProveedorDto>;
}) => {
  const address = column.original.direccion;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <MapPin className="text-gray-700 dark:text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm text-gray-700 dark:text-white max-w-lg">
          {address}
        </p>
      </PopoverContent>
    </Popover>
  );
};
