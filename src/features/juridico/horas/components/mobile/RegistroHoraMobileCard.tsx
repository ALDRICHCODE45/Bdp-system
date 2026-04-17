"use client";

import dynamic from "next/dynamic";
import { Eye, Lock, Unlock, MoreHorizontal, Pencil, FilePenLine, Trash2 } from "lucide-react";
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
import { cn } from "@/core/lib/utils";
import { isWithinDeadline } from "@/core/shared/helpers/weekUtils";
import { useDeleteRegistroHora } from "../../hooks/useDeleteRegistroHora.hook";
import { formatHoras } from "../../helpers/formatHoras";
import { formatWeekLabel } from "../RegistroHorasTableColumns";
import type { RegistroHoraDto } from "../../server/dtos/RegistroHoraDto.dto";

const EditRegistroHoraSheet = dynamic(
  () =>
    import("../EditRegistroHoraSheet").then((mod) => ({
      default: mod.EditRegistroHoraSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

const SolicitarEdicionDialog = dynamic(
  () =>
    import("../SolicitarEdicionDialog").then((mod) => ({
      default: mod.SolicitarEdicionDialog,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

interface RegistroHoraMobileCardProps {
  registro: RegistroHoraDto;
  onViewDetail: (registro: RegistroHoraDto) => void;
}

export function RegistroHoraMobileCard({
  registro,
  onViewDetail,
}: RegistroHoraMobileCardProps) {
  const {
    isOpen: isEditOpen,
    openModal: openEdit,
    closeModal: closeEdit,
  } = useModalState();

  const {
    isOpen: isSolicitarOpen,
    openModal: openSolicitar,
    closeModal: closeSolicitar,
  } = useModalState();

  const deleteMutation = useDeleteRegistroHora();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(registro.id);
  };

  const isDeadlinePassed = !isWithinDeadline(registro.ano, registro.semana);
  const canEdit = registro.editable;
  const canSolicitar = !registro.editable && isDeadlinePassed;

  const weekLabel = formatWeekLabel(registro.ano, registro.semana);
  const horasLabel = formatHoras(registro.horas);

  // Truncate asunto for dropdown label
  const truncatedAsunto =
    registro.asuntoJuridicoNombre.length > 28
      ? registro.asuntoJuridicoNombre.slice(0, 28) + "…"
      : registro.asuntoJuridicoNombre;

  return (
    <>
      <div
        className="bg-card border rounded-xl p-4 shadow-sm hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onViewDetail(registro)}
      >
        {/* ── Línea 1: Semana + Horas + estado editable ─────────────────── */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-mono text-xs shrink-0">
              {weekLabel}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-mono text-xs shrink-0"
            >
              {horasLabel}
            </Badge>
          </div>
          <span
            className={cn(
              "shrink-0",
              canEdit
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground"
            )}
            title={canEdit ? "Editable" : "Bloqueado"}
          >
            {canEdit ? (
              <Unlock className="size-3.5" />
            ) : (
              <Lock className="size-3.5" />
            )}
          </span>
        </div>

        {/* ── Línea 2: Equipo — Cliente ─────────────────────────────────── */}
        <p className="text-xs text-muted-foreground truncate mb-0.5">
          {registro.equipoJuridicoNombre} —{" "}
          <span className="font-medium text-foreground">
            {registro.clienteJuridicoNombre}
          </span>
        </p>

        {/* ── Línea 3: Asunto ───────────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground truncate mb-1.5">
          {registro.asuntoJuridicoNombre}
        </p>

        {/* ── Línea 4: Descripción truncada ─────────────────────────────── */}
        {registro.descripcion && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {registro.descripcion}
          </p>
        )}

        {/* ── Footer: Abogado + menú ────────────────────────────────────── */}
        <div
          className="flex items-center justify-between pt-2 border-t border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-muted-foreground truncate flex-1">
            {registro.usuarioNombre}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {truncatedAsunto}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Ver detalles */}
              <DropdownMenuItem
                onClick={() => onViewDetail(registro)}
                className="gap-2"
              >
                <Eye className="size-4 text-muted-foreground" />
                Ver detalles
              </DropdownMenuItem>

              {/* Editar — solo si editable */}
              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <PermissionGuard
                    permissions={[
                      PermissionActions["juridico-horas"].registrar,
                      PermissionActions["juridico-horas"].gestionar,
                    ]}
                  >
                    <DropdownMenuItem onClick={openEdit} className="gap-2">
                      <Pencil className="size-4 text-muted-foreground" />
                      Editar
                    </DropdownMenuItem>
                  </PermissionGuard>
                </>
              )}

              {/* Solicitar edición — si bloqueado y fuera de plazo */}
              {canSolicitar && (
                <>
                  <DropdownMenuSeparator />
                  <PermissionGuard
                    permissions={[
                      PermissionActions["juridico-horas"]["solicitar-edicion"],
                      PermissionActions["juridico-horas"].gestionar,
                    ]}
                  >
                    <DropdownMenuItem
                      onClick={openSolicitar}
                      className="gap-2"
                    >
                      <FilePenLine className="size-4 text-muted-foreground" />
                      Solicitar Edición
                    </DropdownMenuItem>
                  </PermissionGuard>
                </>
              )}

              {/* Eliminar */}
              <DropdownMenuSeparator />
              <PermissionGuard
                permissions={[
                  PermissionActions["juridico-horas"].registrar,
                  PermissionActions["juridico-horas"].gestionar,
                ]}
              >
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
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
          PermissionActions["juridico-horas"].registrar,
          PermissionActions["juridico-horas"].gestionar,
        ]}
      >
        {isEditOpen && (
          <EditRegistroHoraSheet
            registro={registro}
            isOpen={true}
            onClose={closeEdit}
          />
        )}
      </PermissionGuard>

      {/* Solicitar edición dialog */}
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-horas"]["solicitar-edicion"],
          PermissionActions["juridico-horas"].gestionar,
        ]}
      >
        {isSolicitarOpen && (
          <SolicitarEdicionDialog
            registroHoraId={registro.id}
            semana={registro.semana}
            ano={registro.ano}
            isOpen={true}
            onClose={closeSolicitar}
          />
        )}
      </PermissionGuard>
    </>
  );
}
