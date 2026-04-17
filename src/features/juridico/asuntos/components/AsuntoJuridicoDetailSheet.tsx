"use client";

import dynamic from "next/dynamic";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Separator } from "@/core/shared/ui/separator";

import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useDeleteAsuntoJuridico } from "../hooks/useDeleteAsuntoJuridico.hook";
import { cn } from "@/core/lib/utils";
import type { AsuntoJuridicoDto } from "../server/dtos/AsuntoJuridicoDto.dto";

const EditAsuntoJuridicoSheet = dynamic(
  () =>
    import("./EditAsuntoJuridicoSheet").then((mod) => ({
      default: mod.EditAsuntoJuridicoSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

const DeleteAsuntoJuridicoAlertDialog = dynamic(
  () =>
    import("./DeleteAsuntoJuridicoAlertDialog").then((mod) => ({
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
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  INACTIVO: {
    label: "Inactivo",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  CERRADO: {
    label: "Cerrado",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};

// ─── InfoRow ────────────────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface AsuntoJuridicoDetailSheetProps {
  asunto: AsuntoJuridicoDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function AsuntoJuridicoDetailSheet({
  asunto,
  open,
  onOpenChange,
}: AsuntoJuridicoDetailSheetProps) {
  const isMobile = useIsMobile();

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
    if (!asunto) return;
    await deleteMutation.mutateAsync(asunto.id);
    closeClose();
    onOpenChange(false);
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return null;
    try {
      return format(new Date(d), "d MMM yyyy", { locale: es });
    } catch {
      return null;
    }
  };

  if (!asunto) return null;

  const estadoConfig = estadoBadgeConfig[asunto.estado] ?? {
    label: asunto.estado,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={cn(
            "p-0 w-full sm:max-w-xl",
            isMobile
              ? "rounded-t-3xl max-h-[92dvh] flex flex-col overflow-hidden"
              : "overflow-y-auto"
          )}
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-lg font-semibold truncate">
                  {asunto.nombre}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", estadoConfig.className)}
                  >
                    {estadoConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* ── Body ───────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Relaciones */}
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                label="Cliente Jurídico"
                value={asunto.clienteJuridicoNombre}
              />
              <InfoRow
                label="Socio Responsable"
                value={asunto.socioNombre}
              />
            </div>

            <Separator />

            {/* Descripción */}
            <div className="space-y-4">
              <InfoRow label="Descripción" value={asunto.descripcion} />
            </div>

            <Separator />

            {/* Auditoría */}
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                label="Fecha de registro"
                value={formatDate(asunto.createdAt)}
              />
              <InfoRow
                label="Última actualización"
                value={formatDate(asunto.updatedAt)}
              />
            </div>
          </div>

          {/* ── Footer — botones Editar / Cerrar ───────────────────────────── */}
          <div className="px-6 py-4 border-t flex items-center gap-3 shrink-0">
            <PermissionGuard
              permissions={[
                PermissionActions["juridico-asuntos"].editar,
                PermissionActions["juridico-asuntos"].gestionar,
              ]}
            >
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={openEdit}
              >
                <Pencil className="size-4" />
                Editar
              </Button>
            </PermissionGuard>

            <PermissionGuard
              permissions={[
                PermissionActions["juridico-asuntos"].eliminar,
                PermissionActions["juridico-asuntos"].gestionar,
              ]}
            >
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={openClose}
                disabled={asunto.estado === "CERRADO"}
              >
                <X className="size-4" />
                Cerrar Asunto
              </Button>
            </PermissionGuard>
          </div>
        </SheetContent>
      </Sheet>

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
