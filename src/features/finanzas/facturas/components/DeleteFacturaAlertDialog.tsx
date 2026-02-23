import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/shared/ui/alert-dialog";
import { Input } from "@/core/shared/ui/input";
import { useDeleteFactura } from "../hooks/useDeleteFactura.hook";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { useState } from "react";

interface DeleteFacturaAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  factura: FacturaDto | null;
}

export function DeleteFacturaAlertDialog({
  isOpen,
  onClose,
  factura,
}: DeleteFacturaAlertDialogProps) {
  const deleteFacturaMutation = useDeleteFactura();
  const [inputValue, setInputValue] = useState("");

  if (!factura) return null;
  const canDelete = factura.status === "borrador";
  const isMatch = inputValue.trim() === factura.id;

  const handleDelete = async () => {
    if (!factura || !isMatch) return;
    try {
      await deleteFacturaMutation.mutateAsync(factura.id);
      onClose();
      setInputValue(""); // Clean input on success
    } catch (error) {
      console.error("Error al eliminar factura:", error);
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={() => {
        onClose();
        setInputValue("");
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de que deseas eliminar esta factura?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {canDelete ? (
              <>
                Esta acción <b>no se puede deshacer</b>. Para confirmar, por
                favor escribe el{" "}
                <b>
                  ID de la factura (<code>{factura.id}</code>)
                </b>{" "}
                debajo.
              </>
            ) : (
              <>
                Solo se pueden eliminar facturas en estado{" "}
                <strong>BORRADOR</strong>. Esta factura tiene el estado{" "}
                <strong>{factura.status.toUpperCase()}</strong>.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {canDelete && (
          <div className="py-3">
            <Input
              autoFocus
              placeholder="Escribe el id de la factura"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              data-testid="delete-factura-confirm-input"
            />
            {!isMatch && inputValue.length > 0 && (
              <span className="text-xs text-red-500 mt-1 block">
                El id de la factura no coincide.
              </span>
            )}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteFacturaMutation.isPending}
            onClick={() => {
              setInputValue("");
            }}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete || !isMatch || deleteFacturaMutation.isPending}
            className={!canDelete ? "opacity-50 cursor-not-allowed" : ""}
          >
            {deleteFacturaMutation.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
