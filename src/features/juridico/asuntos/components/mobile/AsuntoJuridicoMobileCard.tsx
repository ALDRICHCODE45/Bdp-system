"use client";

import dynamic from "next/dynamic";
import { Eye, MoreHorizontal, Pencil, X } from "lucide-react";
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
import { useModalState } from "@/core/shared/hooks/useModalState";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useDeleteAsuntoJuridico } from "../../hooks/useDeleteAsuntoJuridico.hook";
import { cn } from "@/core/lib/utils";
import type { AsuntoJuridicoDto } from "../../server/dtos/AsuntoJuridicoDto.dto";

const EditAsuntoJuridicoSheet = dynamic(
  () =>
    import("../EditAsuntoJuridicoSheet").then((mod) => ({
      default: mod.EditAsuntoJuridicoSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

const DeleteAsuntoJuridicoAlertDialog = dynamic(
  () =>
    import("../DeleteAsuntoJuridicoAlertDialog").then((mod) => ({
      default: mod.DeleteAsuntoJuridicoAlertDialog,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

// ─── Estado badge config ─────────────────────────────────────────────────────
const estadoBadgeConfig: Record<
  string,
  { label: string; className: string }
> = {
  ACTIVO: {
    label: "Activo",
    className: "bg-green-100 text-green-800 text-xs",
  },
  INACTIVO: {
    label: "Inactivo",
    className: "bg-yellow-100 text-yellow-800 text-xs",
  },
  CERRADO: {
    label: "Cerrado",
    className: "bg-red-100 text-red-800 text-xs",
  },
};

interface AsuntoJuridicoMobileCardProps {
  asunto: AsuntoJuridicoDto;
  onViewDetail: (asunto: AsuntoJuridicoDto) => void;
}

export function AsuntoJuridicoMobileCard({
  asunto,
  onViewDetail,
}: AsuntoJuridicoMobileCardProps) {
  const {
    isOpen: isEditOpen,
    openModal: openEdit,
    closeModal: closeEdit,
  } = useModalState();

  const {
    isOpen: isCloseOpen,
    openModal: openClose,
    closeModal: closeClose,
  } = useModalState();

  const deleteMutation = useDeleteAsuntoJuridico();

  const handleClose = async () => {
    await deleteMutation.mutateAsync(asunto.id);
    closeClose();
  };

  const truncatedNombre =
    asunto.nombre.length > 28
      ? asunto.nombre.slice(0, 28) + "…"
      : asunto.nombre;

  const estadoConfig = estadoBadgeConfig[asunto.estado] ?? {
    label: asunto.estado,
    className: "bg-gray-100 text-gray-600 text-xs",
  };

  return (
    <>
      <div
        className="bg-card border rounded-xl p-4 shadow-sm hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onViewDetail(asunto)}
      >
        {/* ── Línea 1: Nombre + estado badge ──────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="font-medium text-sm truncate flex-1 leading-tight">
            {asunto.nombre}
          </span>
          <div className="shrink-0">
            <Badge variant="secondary" className={cn(estadoConfig.className)}>
              {estadoConfig.label}
            </Badge>
          </div>
        </div>

        {/* ── Línea 2: clienteNombre → socioNombre ────────────────────── */}
        <div className="mb-1 text-xs text-muted-foreground truncate">
          {[asunto.clienteJuridicoNombre, asunto.socioNombre]
            .filter(Boolean)
            .join(" → ")}
        </div>

        {/* ── Línea 3: descripcion truncada ────────────────────────────── */}
        {asunto.descripcion && (
          <p className="text-xs text-muted-foreground truncate mb-2.5">
            {asunto.descripcion}
          </p>
        )}

        {/* ── Footer: menú de acciones ──────────────────────────────────── */}
        <div
          className="flex items-center justify-end mt-2 pt-2 border-t border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {truncatedNombre}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Ver detalles */}
              <DropdownMenuItem
                onClick={() => onViewDetail(asunto)}
                className="gap-2"
              >
                <Eye className="size-4 text-muted-foreground" />
                Ver detalles
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Editar */}
              <PermissionGuard
                permissions={[
                  PermissionActions["juridico-asuntos"].editar,
                  PermissionActions["juridico-asuntos"].gestionar,
                ]}
              >
                <DropdownMenuItem onClick={openEdit} className="gap-2">
                  <Pencil className="size-4 text-muted-foreground" />
                  Editar
                </DropdownMenuItem>
              </PermissionGuard>

              {/* Cerrar asunto */}
              <DropdownMenuSeparator />
              <PermissionGuard
                permissions={[
                  PermissionActions["juridico-asuntos"].eliminar,
                  PermissionActions["juridico-asuntos"].gestionar,
                ]}
              >
                <DropdownMenuItem
                  onClick={openClose}
                  className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  disabled={asunto.estado === "CERRADO"}
                >
                  <X className="size-4" />
                  Cerrar
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit sheet */}
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-asuntos"].editar,
          PermissionActions["juridico-asuntos"].gestionar,
        ]}
      >
        {isEditOpen && (
          <EditAsuntoJuridicoSheet
            asunto={asunto}
            isOpen={true}
            onClose={closeEdit}
          />
        )}
      </PermissionGuard>

      {/* Close dialog */}
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-asuntos"].eliminar,
          PermissionActions["juridico-asuntos"].gestionar,
        ]}
      >
        {isCloseOpen && (
          <DeleteAsuntoJuridicoAlertDialog
            isOpen={isCloseOpen}
            onOpenChange={closeClose}
            onConfirmClose={handleClose}
            asuntoNombre={asunto.nombre}
            isLoading={deleteMutation.isPending}
          />
        )}
      </PermissionGuard>
    </>
  );
}
