"use client";

import dynamic from "next/dynamic";
import { Eye, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
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
import { useDeleteEquipoJuridico } from "../../hooks/useDeleteEquipoJuridico.hook";
import type { EquipoJuridicoDto } from "../../server/dtos/EquipoJuridicoDto.dto";

const EditEquipoJuridicoSheet = dynamic(
  () =>
    import("../EditEquipoJuridicoSheet").then((mod) => ({
      default: mod.EditEquipoJuridicoSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

const DeleteEquipoJuridicoAlertDialog = dynamic(
  () =>
    import("../DeleteEquipoJuridicoAlertDialog").then((mod) => ({
      default: mod.DeleteEquipoJuridicoAlertDialog,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

interface EquipoJuridicoMobileCardProps {
  equipo: EquipoJuridicoDto;
  onViewDetail: (equipo: EquipoJuridicoDto) => void;
}

export function EquipoJuridicoMobileCard({
  equipo,
  onViewDetail,
}: EquipoJuridicoMobileCardProps) {
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

  const deleteMutation = useDeleteEquipoJuridico();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(equipo.id);
    closeDelete();
  };

  const truncatedNombre =
    equipo.nombre.length > 28
      ? equipo.nombre.slice(0, 28) + "…"
      : equipo.nombre;

  // Build members preview: first 2-3 names + "+N más"
  const memberNames = equipo.miembros.map((m) => m.userName).filter(Boolean);
  const maxPreview = 2;
  const membersPreview =
    memberNames.length <= maxPreview
      ? memberNames.join(", ")
      : `${memberNames.slice(0, maxPreview).join(", ")}, +${memberNames.length - maxPreview} más`;

  return (
    <>
      <div
        className="bg-card border rounded-xl p-4 shadow-sm hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onViewDetail(equipo)}
      >
        {/* ── Línea 1: Nombre + badge miembros ────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="font-medium text-sm truncate flex-1 leading-tight">
            {equipo.nombre}
          </span>
          <Badge
            variant="secondary"
            className="shrink-0 text-xs flex items-center gap-1"
          >
            <Users className="size-3" />
            {equipo.miembrosCount}
          </Badge>
        </div>

        {/* ── Línea 2: Descripción truncada ────────────────────────────── */}
        {equipo.descripcion && (
          <p className="text-xs text-muted-foreground truncate mb-1.5">
            {equipo.descripcion}
          </p>
        )}

        {/* ── Línea 3: Preview de miembros ─────────────────────────────── */}
        {membersPreview && (
          <p className="text-xs text-muted-foreground truncate mb-2.5">
            {membersPreview}
          </p>
        )}

        {/* ── Footer: menú de acciones ─────────────────────────────────── */}
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
                onClick={() => onViewDetail(equipo)}
                className="gap-2"
              >
                <Eye className="size-4 text-muted-foreground" />
                Ver detalles
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Editar */}
              <PermissionGuard
                permissions={[
                  PermissionActions["juridico-equipos"].editar,
                  PermissionActions["juridico-equipos"].gestionar,
                ]}
              >
                <DropdownMenuItem onClick={openEdit} className="gap-2">
                  <Pencil className="size-4 text-muted-foreground" />
                  Editar / Miembros
                </DropdownMenuItem>
              </PermissionGuard>

              {/* Eliminar */}
              <DropdownMenuSeparator />
              <PermissionGuard
                permissions={[
                  PermissionActions["juridico-equipos"].eliminar,
                  PermissionActions["juridico-equipos"].gestionar,
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
          PermissionActions["juridico-equipos"].editar,
          PermissionActions["juridico-equipos"].gestionar,
        ]}
      >
        {isEditOpen && (
          <EditEquipoJuridicoSheet
            equipo={equipo}
            isOpen={true}
            onClose={closeEdit}
          />
        )}
      </PermissionGuard>

      {/* Delete dialog */}
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-equipos"].eliminar,
          PermissionActions["juridico-equipos"].gestionar,
        ]}
      >
        {isDeleteOpen && (
          <DeleteEquipoJuridicoAlertDialog
            isOpen={isDeleteOpen}
            onOpenChange={closeDelete}
            onConfirmDelete={handleDelete}
            equipoNombre={equipo.nombre}
            isLoading={deleteMutation.isPending}
          />
        )}
      </PermissionGuard>
    </>
  );
}
