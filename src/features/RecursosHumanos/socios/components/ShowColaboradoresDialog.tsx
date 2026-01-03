import { Button } from "@/core/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/shared/ui/dialog";
import { Row } from "@tanstack/react-table";
import { SocioDto } from "../server/dtos/SocioDto.dto";
import { ShowColaboradoresDialogCard } from "./ShowColaboradoresDialogCard";
import { useGetColaboradoresBySocioId } from "../hooks/useGetColaboradoresBySocioId.hook";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/core/shared/ui/empty";
import { Users, UserX } from "lucide-react";

interface Props {
  row: Row<SocioDto>;
}

export const ShowColaboradoresDialog = ({ row }: Props) => {
  const {
    data: colaboradores,
    isLoading,
    refetch,
  } = useGetColaboradoresBySocioId(row.original.id);

  return (
    <>
      <Dialog onOpenChange={() => refetch()}>
        <DialogTrigger asChild>
          <Button variant={"outline"}>
            <Users strokeWidth={1.5} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Colaboradores Asociados</DialogTitle>
            <DialogDescription>
              Estos son los colaboradores asociados a este socio.
            </DialogDescription>
          </DialogHeader>
          <section className="flex flex-col gap-3 max-h-[200px] overflow-y-scroll">
            {isLoading && (
              <>
                <p>Cargando...</p>
              </>
            )}
            {colaboradores && colaboradores.length > 0 ? (
              colaboradores?.map((colaborador) => (
                <ShowColaboradoresDialogCard
                  key={colaborador.id}
                  useremail={colaborador.correo}
                  username={colaborador.name}
                  userId={colaborador.id}
                />
              ))
            ) : (
              <>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <UserX />
                    </EmptyMedia>
                    <EmptyTitle>No hay colaboradores</EmptyTitle>
                    <EmptyDescription>
                      Ningun colaborador ha sido asignado a este socio todavia
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </>
            )}
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
};
