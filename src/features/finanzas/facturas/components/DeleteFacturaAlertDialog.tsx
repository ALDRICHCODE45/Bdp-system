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
import { useDeleteFactura } from "../hooks/useDeleteFactura.hook";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";

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

  const handleDelete = async () => {
    if (!factura) return;

    try {
      await deleteFacturaMutation.mutateAsync(factura.id);
      onClose();
    } catch (error) {
      console.error("Error al eliminar factura:", error);
    }
  };

  if (!factura) return null;

  const canDelete = factura.estado === "borrador";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar factura?</AlertDialogTitle>
          <AlertDialogDescription>
            {canDelete ? (
              <>
                Esta acción no se puede deshacer. La factura con folio fiscal{" "}
                <strong>{factura.folioFiscal}</strong> será eliminada
                permanentemente.
              </>
            ) : (
              <>
                Solo se pueden eliminar facturas en estado <strong>BORRADOR</strong>.
                Esta factura tiene el estado <strong>{factura.estado.toUpperCase()}</strong>.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete || deleteFacturaMutation.isPending}
            className={!canDelete ? "opacity-50 cursor-not-allowed" : ""}
          >
            {deleteFacturaMutation.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

