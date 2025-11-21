"use client";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
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
import { FacturaActionsConfig } from "./FacturaActions.config";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { exportFacturaToPDF } from "../../helpers/exportFacturaToPDF";

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
}

export function FacturaRowActions({ row }: FacturaRowActionsProps) {
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

  const actions = FacturaActionsConfig(
    openModal,
    openDeleteModal,
    openHistory,
    () => exportFacturaToPDF(factura)
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action) =>
            action.subItems ? (
              <DropdownMenuSub key={action.id}>
                <DropdownMenuSubTrigger>{action.label}</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {action.subItems.map((subItem) => (
                      <DropdownMenuItem
                        key={subItem.id}
                        onClick={subItem.onClick}
                      >
                        {subItem.icon && <subItem.icon />}
                        {subItem.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ) : (
              <DropdownMenuItem
                key={action.id}
                onClick={action.onClick}
                className={
                  action.variant === "destructive" ? "text-destructive" : ""
                }
              >
                {action.label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isOpen && (
        <EditFacturaSheet
          isOpen={true}
          onClose={closeModal}
          factura={factura}
        />
      )}

      {isDeleteOpen && (
        <DeleteFacturaAlertDialog
          isOpen={isDeleteOpen}
          onClose={closeDeleteModal}
          factura={factura}
        />
      )}

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
