import { Row } from "@tanstack/react-table";
import { ClienteProveedorDto } from "../server/dtos/ClienteProveedorDto.dto";
import { Button } from "@/core/shared/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const ViewFechaRegistroColumn = ({
  column,
}: {
  column: Row<ClienteProveedorDto>;
}) => {
  const fechaRegistro = column.original.fechaRegistro;

  return (
    <>
      <Button variant="outline">
        {format(fechaRegistro, "EEEE, dd MMMM yyyy", {
          locale: es,
        })}
      </Button>
    </>
  );
};
