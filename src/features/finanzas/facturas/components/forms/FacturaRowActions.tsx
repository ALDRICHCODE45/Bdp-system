"use client";
import { Row } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2, History, FileText } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { FacturaDto } from "../../server/dtos/FacturaDto.dto";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { exportFacturaToPDF } from "../../helpers/exportFacturaToPDF";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const EditFacturaSheet = dynamic(
  () =>
    import("../EditFacturaSheet").then((mod) => ({
      default: mod.EditFacturaSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const DeleteFacturaAlertDialog = dynamic(
  () =>
    import("../DeleteFacturaAlertDialog").then((mod) => ({
      default: mod.DeleteFacturaAlertDialog,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const FacturaHistorySheet = dynamic(
  () =>
    import("../FacturaHistorySheet").then((mod) => ({
      default: mod.FacturaHistorySheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface FacturaRowActionsProps {
  row: Row<FacturaDto>;
  onViewDetail?: (factura: FacturaDto) => void;
}

export function FacturaRowActions({ row, onViewDetail }: FacturaRowActionsProps) {
  const { isOpen, openModal, closeModal } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModalState();
  const {
    isOpen: isHistoryOpen,
    openModal: openHistory,
    closeModal: closeHistory,
  } = useModalState();
  const factura = row.original;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            {factura.concepto.length > 24
              ? factura.concepto.slice(0, 24) + "…"
              : factura.concepto}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Ver detalles */}
          {onViewDetail && (
            <DropdownMenuItem
              onClick={() => onViewDetail(factura)}
              className="gap-2"
            >
              <Eye className="size-4 text-muted-foreground" />
              Ver detalles
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Editar */}
          <PermissionGuard
            permissions={[
              PermissionActions.facturas.editar,
              PermissionActions.facturas.gestionar,
            ]}
          >
            <DropdownMenuItem onClick={openModal} className="gap-2">
              <Pencil className="size-4 text-muted-foreground" />
              Editar
            </DropdownMenuItem>
          </PermissionGuard>

          {/* Historial */}
          <DropdownMenuItem onClick={openHistory} className="gap-2">
            <History className="size-4 text-muted-foreground" />
            Historial
          </DropdownMenuItem>

          {/* Exportar PDF */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <FileText className="size-4 text-muted-foreground" />
              Exportar
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => exportFacturaToPDF(factura)}
                  className="gap-2"
                >
                  <FileText className="size-4" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Eliminar — destructive al final */}
          <PermissionGuard
            permissions={[
              PermissionActions.facturas.eliminar,
              PermissionActions.facturas.gestionar,
            ]}
          >
            <DropdownMenuItem
              onClick={openDeleteModal}
              className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="size-4" />
              Eliminar
            </DropdownMenuItem>
          </PermissionGuard>
        </DropdownMenuContent>
      </DropdownMenu>

      <PermissionGuard
        permissions={[
          PermissionActions.facturas.editar,
          PermissionActions.facturas.gestionar,
        ]}
      >
        {isOpen && (
          <EditFacturaSheet
            isOpen={true}
            onClose={closeModal}
            factura={factura}
          />
        )}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions.facturas.eliminar,
          PermissionActions.facturas.gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteFacturaAlertDialog
            isOpen={isDeleteOpen}
            onClose={closeDeleteModal}
            factura={factura}
          />
        )}
      </PermissionGuard>

      {isHistoryOpen && (
        <FacturaHistorySheet
          isOpen={true}
          onClose={closeHistory}
          facturaConcepto={factura.concepto}
          facturaId={factura.id}
        />
      )}
    </>
  );
}
