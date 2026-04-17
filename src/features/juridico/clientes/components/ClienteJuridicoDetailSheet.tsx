"use client";

import dynamic from "next/dynamic";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";

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
import { useDeleteClienteJuridico } from "../hooks/useDeleteClienteJuridico.hook";
import { cn } from "@/core/lib/utils";
import type { ClienteJuridicoDto } from "../server/dtos/ClienteJuridicoDto.dto";

const EditClienteJuridicoSheet = dynamic(
  () =>
    import("./EditClienteJuridicoSheet").then((mod) => ({
      default: mod.EditClienteJuridicoSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

const DeleteClienteJuridicoAlertDialog = dynamic(
  () =>
    import("./DeleteClienteJuridicoAlertDialog").then((mod) => ({
      default: mod.DeleteClienteJuridicoAlertDialog,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

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
interface ClienteJuridicoDetailSheetProps {
  cliente: ClienteJuridicoDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ClienteJuridicoDetailSheet({
  cliente,
  open,
  onOpenChange,
}: ClienteJuridicoDetailSheetProps) {
  const isMobile = useIsMobile();

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

  const deleteMutation = useDeleteClienteJuridico();

  const handleDelete = async () => {
    if (!cliente) return;
    await deleteMutation.mutateAsync(cliente.id);
    closeDelete();
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

  if (!cliente) return null;

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
                  {cliente.nombre}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge
                    variant={cliente.activo ? "default" : "secondary"}
                    className={cn(
                      "text-xs",
                      cliente.activo
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {cliente.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* ── Body ───────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Datos principales */}
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="RFC" value={cliente.rfc} />
              <InfoRow label="Email" value={cliente.email} />
              <InfoRow label="Teléfono" value={cliente.telefono} />
              <InfoRow label="Contacto" value={cliente.contacto} />
            </div>

            <Separator />

            {/* Dirección y Notas */}
            <div className="space-y-4">
              <InfoRow label="Dirección" value={cliente.direccion} />
              <InfoRow label="Notas" value={cliente.notas} />
            </div>

            <Separator />

            {/* Auditoría */}
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                label="Fecha de registro"
                value={formatDate(cliente.createdAt)}
              />
              <InfoRow
                label="Última actualización"
                value={formatDate(cliente.updatedAt)}
              />
            </div>
          </div>

          {/* ── Footer — botones Editar / Eliminar ─────────────────────────── */}
          <div className="px-6 py-4 border-t flex items-center gap-3 shrink-0">
            <PermissionGuard
              permissions={[
                PermissionActions["juridico-clientes"].editar,
                PermissionActions["juridico-clientes"].gestionar,
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
                PermissionActions["juridico-clientes"].eliminar,
                PermissionActions["juridico-clientes"].gestionar,
              ]}
            >
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={openDelete}
              >
                <Trash2 className="size-4" />
                Eliminar
              </Button>
            </PermissionGuard>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit sheet */}
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-clientes"].editar,
          PermissionActions["juridico-clientes"].gestionar,
        ]}
      >
        {isEditOpen && (
          <EditClienteJuridicoSheet
            cliente={cliente}
            isOpen={true}
            onClose={closeEdit}
          />
        )}
      </PermissionGuard>

      {/* Delete dialog */}
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-clientes"].eliminar,
          PermissionActions["juridico-clientes"].gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteClienteJuridicoAlertDialog
            isOpen={isDeleteOpen}
            onOpenChange={closeDelete}
            onConfirmDelete={handleDelete}
            clienteNombre={cliente.nombre}
            isLoading={deleteMutation.isPending}
          />
        )}
      </PermissionGuard>
    </>
  );
}
