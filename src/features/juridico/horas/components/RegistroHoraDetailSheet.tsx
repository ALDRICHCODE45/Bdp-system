"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Lock,
  Unlock,
  Pencil,
  FilePenLine,
  History,
  AlertCircle,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Separator } from "@/core/shared/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/core/shared/ui/tabs";
import { Spinner } from "@/core/shared/ui/spinner";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineItem,
  TimelineTitle,
} from "@/core/shared/ui/timeline";

import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { cn } from "@/core/lib/utils";
import { isWithinDeadline } from "@/core/shared/helpers/weekUtils";

import { formatHoras } from "../helpers/formatHoras";
import { formatWeekLabel } from "./RegistroHorasTableColumns";
import { useGetRegistroHoraHistorial } from "../hooks/useGetRegistroHoraHistorial.hook";
import type { RegistroHoraDto } from "../server/dtos/RegistroHoraDto.dto";

const EditRegistroHoraSheet = dynamic(
  () =>
    import("./EditRegistroHoraSheet").then((mod) => ({
      default: mod.EditRegistroHoraSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

const SolicitarEdicionDialog = dynamic(
  () =>
    import("./SolicitarEdicionDialog").then((mod) => ({
      default: mod.SolicitarEdicionDialog,
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

// ─── SectionHeader ───────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
      {title}
    </h4>
  );
}

// ─── InformacionTab ──────────────────────────────────────────────────────────
function InformacionTab({ registro }: { registro: RegistroHoraDto }) {
  const formatDate = (d: string | null | undefined) => {
    if (!d) return null;
    try {
      return format(new Date(d), "d MMM yyyy HH:mm", { locale: es });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Abogado */}
      <div>
        <SectionHeader title="Abogado" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Nombre" value={registro.usuarioNombre} />
          <InfoRow label="Email" value={registro.usuarioEmail} />
        </div>
      </div>

      <Separator />

      {/* Asignación */}
      <div>
        <SectionHeader title="Asignación" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Equipo" value={registro.equipoJuridicoNombre} />
          <InfoRow label="Socio" value={registro.socioNombre} />
          <InfoRow label="Cliente" value={registro.clienteJuridicoNombre} />
          <InfoRow label="Asunto" value={registro.asuntoJuridicoNombre} />
        </div>
      </div>

      <Separator />

      {/* Horas */}
      <div>
        <SectionHeader title="Horas registradas" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow
            label="Horas"
            value={
              <span className="font-mono text-blue-700 dark:text-blue-400">
                {formatHoras(registro.horas)}
              </span>
            }
          />
          <InfoRow
            label="Semana"
            value={formatWeekLabel(registro.ano, registro.semana)}
          />
          <InfoRow label="Año" value={String(registro.ano)} />
          <InfoRow
            label="Estado"
            value={
              registro.editable ? (
                <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
                  <Unlock className="h-3.5 w-3.5" />
                  Editable
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  Bloqueado
                </span>
              )
            }
          />
        </div>
      </div>

      {registro.descripcion && (
        <>
          <Separator />
          <div>
            <SectionHeader title="Descripción" />
            <p className="text-sm leading-relaxed text-foreground">
              {registro.descripcion}
            </p>
          </div>
        </>
      )}

      <Separator />

      {/* Auditoría */}
      <div>
        <SectionHeader title="Auditoría" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow
            label="Fecha de registro"
            value={formatDate(registro.createdAt)}
          />
          <InfoRow
            label="Última actualización"
            value={formatDate(registro.updatedAt)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── HistorialTab ─────────────────────────────────────────────────────────────
function HistorialTab({
  registroHoraId,
  isActive,
}: {
  registroHoraId: string;
  isActive: boolean;
}) {
  const {
    data: historial,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRegistroHoraHistorial(registroHoraId);

  const formatFecha = (fechaString: string) => {
    try {
      return format(new Date(fechaString), "d MMM yyyy HH:mm", { locale: es });
    } catch {
      return fechaString;
    }
  };

  if (!isActive && !historial) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner className="size-8" />
        <p className="mt-4 text-sm text-muted-foreground">
          Cargando historial...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-destructive mb-2">Error</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "Error al cargar el historial"}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!historial || historial.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="size-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No hay historial de cambios para este registro
        </p>
      </div>
    );
  }

  return (
    <Timeline orientation="vertical" className="p-2">
      {historial.map((item, index) => (
        <TimelineItem
          key={item.id}
          step={index + 1}
          className="group-data-[orientation=vertical]/timeline:ms-0 group-data-[orientation=vertical]/timeline:not-last:pb-8"
        >
          <TimelineHeader className="relative">
            <TimelineTitle className="mt-0.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Campo:
              </span>{" "}
              <span className="font-semibold">{item.campo}</span>
            </TimelineTitle>
          </TimelineHeader>
          <TimelineContent className="mt-2 rounded-lg border px-4 py-3 text-foreground bg-muted/30">
            <div className="text-sm leading-relaxed space-y-1">
              {item.valorAnterior !== null && (
                <p>
                  <span className="text-muted-foreground text-xs">
                    Anterior:
                  </span>{" "}
                  <span className="line-through text-muted-foreground">
                    {item.valorAnterior}
                  </span>
                </p>
              )}
              <p>
                <span className="text-muted-foreground text-xs">Nuevo:</span>{" "}
                <span className="font-medium">{item.valorNuevo}</span>
              </p>
            </div>
            {item.motivo && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Motivo:</span> {item.motivo}
                </p>
              </div>
            )}
            <TimelineDate className="mt-3 mb-0 text-xs">
              {formatFecha(item.fechaCambio)}
            </TimelineDate>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface RegistroHoraDetailSheetProps {
  registro: RegistroHoraDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function RegistroHoraDetailSheet({
  registro,
  open,
  onOpenChange,
}: RegistroHoraDetailSheetProps) {
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState("info");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(["info"])
  );

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

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => new Set([...prev, tab]));
  }, []);

  if (!registro) return null;

  const isDeadlinePassed = !isWithinDeadline(registro.ano, registro.semana);
  const canEdit = registro.editable;
  const canSolicitar = !registro.editable && isDeadlinePassed;

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
          {/* ── Header ────────────────────────────────────────────────────── */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-lg font-semibold">
                  Registro de Horas
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge
                    variant="outline"
                    className="font-mono text-xs whitespace-nowrap"
                  >
                    {formatWeekLabel(registro.ano, registro.semana)}
                  </Badge>
                  {registro.editable ? (
                    <Badge
                      variant="outline"
                      className="text-xs gap-1 text-green-700 border-green-300 dark:text-green-400 dark:border-green-700"
                    >
                      <Unlock className="size-3" />
                      Editable
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs gap-1 text-muted-foreground"
                    >
                      <Lock className="size-3" />
                      Bloqueado
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {formatHoras(registro.horas)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {registro.usuarioNombre}
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* ── Tabs ──────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">
                  Información
                </TabsTrigger>
                <TabsTrigger value="historial" className="flex-1">
                  <span className="flex items-center gap-1.5">
                    <History className="size-3" />
                    Historial
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Información */}
              <TabsContent value="info" className="mt-5">
                <InformacionTab registro={registro} />
              </TabsContent>

              {/* Historial — lazy loaded */}
              <TabsContent value="historial" className="mt-5">
                {(activeTab === "historial" ||
                  visitedTabs.has("historial")) && (
                  <HistorialTab
                    registroHoraId={registro.id}
                    isActive={activeTab === "historial"}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Footer ────────────────────────────────────────────────────── */}
          {(canEdit || canSolicitar) && (
            <div className="px-6 py-4 border-t flex items-center gap-3 shrink-0">
              {canEdit && (
                <PermissionGuard
                  permissions={[
                    PermissionActions["juridico-horas"].registrar,
                    PermissionActions["juridico-horas"].gestionar,
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
              )}

              {canSolicitar && (
                <PermissionGuard
                  permissions={[
                    PermissionActions["juridico-horas"]["solicitar-edicion"],
                    PermissionActions["juridico-horas"].gestionar,
                  ]}
                >
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={openSolicitar}
                  >
                    <FilePenLine className="size-4" />
                    Solicitar Edición
                  </Button>
                </PermissionGuard>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

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
