import { Button } from "@/core/shared/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import { BriefcaseBusiness } from "lucide-react";

interface Props {
  telefono: string;
  nombre: string;
  colaboradorName: string;
}

export const ColaboradorReferenciaLaboralDialog = ({
  nombre,
  telefono,
  colaboradorName,
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant={"outline"} size={"icon"}>
          <BriefcaseBusiness strokeWidth={1.25} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-normal">
            Referencia laboral de <span className="">{colaboradorName}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>Nombre: {nombre}</div>
          <div>Telefono: {telefono}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
