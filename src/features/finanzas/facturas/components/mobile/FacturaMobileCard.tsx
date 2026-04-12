"use client";

import { useState } from "react";
import { Copy, Check, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/shared/ui/tooltip";
import type { FacturaDto } from "../../server/dtos/FacturaDto.dto";
import { FacturaStatusBadge } from "../FacturaStatusBadge";
import { getCurrencyFormatter } from "../FacturasTableColumns";
import { isWithin24Hours } from "../../helpers/capturadorUtils";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const EditFacturaSheet = dynamic(
  () =>
    import("../EditFacturaSheet").then((mod) => ({
      default: mod.EditFacturaSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

const DeleteFacturaAlertDialog = dynamic(
  () =>
    import("../DeleteFacturaAlertDialog").then((mod) => ({
      default: mod.DeleteFacturaAlertDialog,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

interface FacturaMobileCardProps {
  factura: FacturaDto;
  isCapturador?: boolean;
  currentUserId?: string;
  onViewDetail: (factura: FacturaDto) => void;
}

export function FacturaMobileCard({
  factura,
  isCapturador = false,
  currentUserId,
  onViewDetail,
}: FacturaMobileCardProps) {
  const [copied, setCopied] = useState(false);

  const {
    isOpen: isEditOpen,
    openModal: openEdit,
    closeModal: closeEdit,
  } = useModalState();
  const {
    isOpen: isDeleteOpen,
    openModal: openDelete,
    closeModal: closeDelete,
  } = useModalState();

  // ── Capturador edit eligibility ──────────────────────────────────────────
  const isOwner = factura.ingresadoPor === currentUserId;
  const isEditable = isWithin24Hours(new Date(factura.createdAt));
  const capturadorCanEdit = isCapturador ? isOwner && isEditable : true;

  const fmt = getCurrencyFormatter(factura.moneda);

  const handleCopyUuid = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(factura.uuid).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const truncatedConcepto =
    factura.concepto.length > 24
      ? factura.concepto.slice(0, 24) + "…"
      : factura.concepto;

  return (
    <>
      <div className="bg-card border rounded-xl p-4 shadow-sm hover:bg-accent/50 transition-colors">
        {/* ── Línea 1: Concepto + Badge status ──────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="font-medium text-sm truncate flex-1 leading-tight">
            {factura.concepto}
          </span>
          {!isCapturador && (
            <div className="shrink-0">
              <FacturaStatusBadge status={factura.status} />
            </div>
          )}
        </div>

        {/* ── Línea 2: UUID + botón copy ────────────────────────────────── */}
        <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
          <span className="font-mono text-xs truncate flex-1">
            {factura.uuid}
          </span>
          <button
            onClick={handleCopyUuid}
            className="shrink-0 p-0.5 rounded hover:bg-accent transition-colors"
            aria-label="Copiar UUID"
          >
            {copied ? (
              <Check className="size-3 text-green-500" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        </div>

        {/* ── Línea 3: Emisor → Receptor ────────────────────────────────── */}
        {(factura.nombreEmisor ?? factura.nombreReceptor) && (
          <p className="text-xs text-muted-foreground truncate mb-2.5">
            {factura.nombreEmisor ?? factura.rfcEmisor}
            {" → "}
            {factura.nombreReceptor ?? factura.rfcReceptor}
          </p>
        )}

        {/* ── Línea 4: Footer — Total + moneda + acciones ───────────────── */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tabular-nums">
              {fmt.format(factura.total)}
            </span>
            <Badge variant="outline" className="font-mono text-xs h-5 px-1.5">
              {factura.moneda}
            </Badge>
          </div>

          {/* ── Dropdown de acciones ───────────────────────────────────── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {truncatedConcepto}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Ver detalles */}
              <DropdownMenuItem
                onClick={() => onViewDetail(factura)}
                className="gap-2"
              >
                <Eye className="size-4 text-muted-foreground" />
                Ver detalles
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Editar */}
              {isCapturador ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <DropdownMenuItem
                        onClick={capturadorCanEdit ? openEdit : undefined}
                        disabled={!capturadorCanEdit}
                        className="gap-2"
                      >
                        <Pencil className="size-4 text-muted-foreground" />
                        Editar
                      </DropdownMenuItem>
                    </span>
                  </TooltipTrigger>
                  {!capturadorCanEdit && (
                    <TooltipContent>
                      <p className="text-xs">
                        {!isOwner
                          ? "Solo podés editar tus propias facturas"
                          : "Solo podés editar facturas de las últimas 24 horas"}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ) : (
                <PermissionGuard
                  permissions={[
                    PermissionActions.facturas.editar,
                    PermissionActions.facturas.gestionar,
                  ]}
                >
                  <DropdownMenuItem onClick={openEdit} className="gap-2">
                    <Pencil className="size-4 text-muted-foreground" />
                    Editar
                  </DropdownMenuItem>
                </PermissionGuard>
              )}

              {/* Eliminar — solo para no capturadores */}
              {!isCapturador && (
                <>
                  <DropdownMenuSeparator />
                  <PermissionGuard
                    permissions={[
                      PermissionActions.facturas.eliminar,
                      PermissionActions.facturas.gestionar,
                    ]}
                  >
                    <DropdownMenuItem
                      onClick={openDelete}
                      className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </PermissionGuard>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit sheet */}
      {isCapturador ? (
        <>
          {isEditOpen && capturadorCanEdit && (
            <EditFacturaSheet
              isOpen={true}
              onClose={closeEdit}
              factura={factura}
              isCapturador={true}
            />
          )}
        </>
      ) : (
        <PermissionGuard
          permissions={[
            PermissionActions.facturas.editar,
            PermissionActions.facturas.gestionar,
          ]}
        >
          {isEditOpen && (
            <EditFacturaSheet
              isOpen={true}
              onClose={closeEdit}
              factura={factura}
            />
          )}
        </PermissionGuard>
      )}

      {/* Delete dialog */}
      {!isCapturador && (
        <PermissionGuard
          permissions={[
            PermissionActions.facturas.eliminar,
            PermissionActions.facturas.gestionar,
          ]}
        >
          {isDeleteOpen && (
            <DeleteFacturaAlertDialog
              isOpen={isDeleteOpen}
              onClose={closeDelete}
              factura={factura}
            />
          )}
        </PermissionGuard>
      )}
    </>
  );
}
