import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/shared/ui/popover";
import { Row } from "@tanstack/react-table";
import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { Button } from "@/core/shared/ui/button";
import { BetweenHorizontalEnd } from "lucide-react";
import { Badge } from "@/core/shared/ui/badge";

export const ActivosRowPopOver = ({ row }: { row: Row<ColaboradorDto> }) => {
  const activos = row.original.activos;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <BetweenHorizontalEnd />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {activos && activos.length > 0 ? (
          activos.map((activo) => (
            <span key={activo} className="m-1">
              <Badge variant={"outline"}>{activo}</Badge>
            </span>
          ))
        ) : (
          <p>sin activos</p>
        )}
      </PopoverContent>
    </Popover>
  );
};
