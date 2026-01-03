import { Button } from "@/core/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/shared/ui/dialog";
import { MapPin } from "lucide-react";

interface Props {
  direccion: string;
}

export const DireccionColaboradorDialog = ({ direccion }: Props) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant={"outline"} size={"icon"}>
          <MapPin strokeWidth={1.25} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Direccion del colaborador</DialogTitle>
          <DialogDescription>{direccion}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
