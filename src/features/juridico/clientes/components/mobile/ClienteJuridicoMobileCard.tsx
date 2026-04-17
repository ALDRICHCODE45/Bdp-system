"use client";

import dynamic from "next/dynamic";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { useDeleteClienteJuridico } from "../../hooks/useDeleteClienteJuridico.hook";
import { cn } from "@/core/lib/utils";
import type { ClienteJuridicoDto } from "../../server/dtos/ClienteJuridicoDto.dto";

const EditClienteJuridicoSheet = dynamic(
  () =>
    import("../EditClienteJuridicoSheet").then((mod) => ({
      default: mod.EditClienteJuridicoSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

const DeleteClienteJuridicoAlertDialog = dynamic(
  () =>
    import("../DeleteClienteJuridicoAlertDialog").then((mod) => ({
      default: mod.DeleteClienteJuridicoAlertDialog,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

interface ClienteJuridicoMobileCardProps {
  cliente: ClienteJuridicoDto;
  onViewDetail: (cliente: ClienteJuridicoDto) => void;
}

export function ClienteJuridicoMobileCard({
  cliente,
  onViewDetail,
}: ClienteJuridicoMobileCardProps) {
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
    await deleteMutation.mutateAsync(cliente.id);
    closeDelete();
  };

  const truncatedNombre =
    cliente.nombre.length > 28
      ? cliente.nombre.slice(0, 28) + "…"
      : cliente.nombre;

  return (
    <>
      <div
        className="bg-card border rounded-xl p-4 shadow-sm hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onViewDetail(cliente)}
      >
        {/* ── Línea 1: Nombre + badge activo ──────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="font-medium text-sm truncate flex-1 leading-tight">
            {cliente.nombre}
          </span>
          <div className="shrink-0 flex items-center">
            <span
              className={cn(
                "size-2 rounded-full",
                cliente.activo ? "bg-green-500" : "bg-gray-400"
              )}
              aria-label={cliente.activo ? "Activo" : "Inactivo"}
            />
          </div>
        </div>

        {/* ── Línea 2: RFC ────────────────────────────────────────────── */}
        <div className="mb-1 text-muted-foreground">
          <span className="font-mono text-xs">
            {cliente.rfc ?? "Sin RFC"}
          </span>
        </div>

        {/* ── Línea 3: Email + Teléfono ────────────────────────────────── */}
        {(cliente.email ?? cliente.telefono) && (
          <p className="text-xs text-muted-foreground truncate mb-2.5">
            {[cliente.email, cliente.telefono].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* ── Footer: Contacto + menú de acciones ──────────────────────── */}
        <div
          className="flex items-center justify-between mt-2 pt-2 border-t border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-muted-foreground truncate flex-1">
            {cliente.contacto ?? ""}
          </span>

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
                onClick={() => onViewDetail(cliente)}
                className="gap-2"
              >
                <Eye className="size-4 text-muted-foreground" />
                Ver detalles
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Editar */}
              <PermissionGuard
                permissions={[
                  PermissionActions["juridico-clientes"].editar,
                  PermissionActions["juridico-clientes"].gestionar,
                ]}
              >
                <DropdownMenuItem onClick={openEdit} className="gap-2">
                  <Pencil className="size-4 text-muted-foreground" />
                  Editar
                </DropdownMenuItem>
              </PermissionGuard>

              {/* Eliminar */}
              <DropdownMenuSeparator />
              <PermissionGuard
                permissions={[
                  PermissionActions["juridico-clientes"].eliminar,
                  PermissionActions["juridico-clientes"].gestionar,
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
