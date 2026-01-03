import { Button } from "@/core/shared/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import { BookMarked } from "lucide-react";

interface Props {
  telefono: string;
  nombre: string;
  parentesco: string;
  colaboradorName: string;
}

export const ColaboradorReferenciaPersonalDialog = ({
  nombre,
  parentesco,
  telefono,
  colaboradorName,
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant={"outline"} size={"icon"}>
          <BookMarked strokeWidth={1.25} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-normal">
            Referencia personal de <span className="">{colaboradorName}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>Nombre: {nombre}</div>
          <div>Parentesco: {parentesco}</div>
          <div>Telefono: {telefono}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
