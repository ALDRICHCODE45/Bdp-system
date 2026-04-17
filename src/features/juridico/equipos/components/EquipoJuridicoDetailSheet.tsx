"use client";

import dynamic from "next/dynamic";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Trash2, Users } from "lucide-react";

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
import { useDeleteEquipoJuridico } from "../hooks/useDeleteEquipoJuridico.hook";
import { cn } from "@/core/lib/utils";
import type { EquipoJuridicoDto } from "../server/dtos/EquipoJuridicoDto.dto";

const EditEquipoJuridicoSheet = dynamic(
  () =>
    import("./EditEquipoJuridicoSheet").then((mod) => ({
      default: mod.EditEquipoJuridicoSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

const DeleteEquipoJuridicoAlertDialog = dynamic(
  () =>
    import("./DeleteEquipoJuridicoAlertDialog").then((mod) => ({
      default: mod.DeleteEquipoJuridicoAlertDialog,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

const EquipoMiembrosManager = dynamic(
  () =>
    import("./EquipoMiembrosManager").then((mod) => ({
      default: mod.EquipoMiembrosManager,
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
interface EquipoJuridicoDetailSheetProps {
  equipo: EquipoJuridicoDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function EquipoJuridicoDetailSheet({
  equipo,
  open,
  onOpenChange,
}: EquipoJuridicoDetailSheetProps) {
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

  const deleteMutation = useDeleteEquipoJuridico();

  const handleDelete = async () => {
    if (!equipo) return;
    await deleteMutation.mutateAsync(equipo.id);
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

  if (!equipo) return null;

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
                  {equipo.nombre}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge
                    variant={equipo.activo ? "default" : "secondary"}
                    className={cn(
                      "text-xs",
                      equipo.activo
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {equipo.activo ? "Activo" : "Inactivo"}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <Users className="size-3" />
                    {equipo.miembrosCount}{" "}
                    {equipo.miembrosCount === 1 ? "miembro" : "miembros"}
                  </Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* ── Body ───────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Descripción */}
            <div className="space-y-1">
              <InfoRow label="Descripción" value={equipo.descripcion} />
            </div>

            <Separator />

            {/* Auditoría */}
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                label="Fecha de creación"
                value={formatDate(equipo.createdAt)}
              />
              <InfoRow
                label="Última actualización"
                value={formatDate(equipo.updatedAt)}
              />
            </div>

            <Separator />

            {/* Miembros */}
            <PermissionGuard
              permissions={[
                PermissionActions["juridico-equipos"].editar,
                PermissionActions["juridico-equipos"].gestionar,
              ]}
              fallback={
                // Read-only member list for users without edit permission
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Miembros del equipo
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {equipo.miembros.length}
                    </Badge>
                  </div>
                  {equipo.miembros.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      Este equipo no tiene miembros aún.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {equipo.miembros.map((miembro) => (
                        <div
                          key={miembro.id}
                          className="flex flex-col rounded-md border px-3 py-2"
                        >
                          <span className="text-sm font-medium">
                            {miembro.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {miembro.userEmail}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              }
            >
              <EquipoMiembrosManager equipo={equipo} />
            </PermissionGuard>
          </div>

          {/* ── Footer — botones Editar / Eliminar ─────────────────────────── */}
          <div className="px-6 py-4 border-t flex items-center gap-3 shrink-0">
            <PermissionGuard
              permissions={[
                PermissionActions["juridico-equipos"].editar,
                PermissionActions["juridico-equipos"].gestionar,
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
                PermissionActions["juridico-equipos"].eliminar,
                PermissionActions["juridico-equipos"].gestionar,
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
