"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { Separator } from "@/core/shared/ui/separator";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
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
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { FileList } from "@/core/shared/components/Files/FileList";
import { getFilesByEntityAction } from "@/features/Files/server/actions/getFilesByEntityAction";

import { cn } from "@/core/lib/utils";
import { useClienteProveedorHistorial } from "../hooks/useClienteProveedorHistorial.hook";
import { formatFieldName } from "../helpers/formatHistorialField";
import { formatChangeDescription } from "../helpers/formatHistorialChange";
import { History, AlertCircle, Paperclip } from "lucide-react";
import type { ClienteProveedorDto } from "../server/dtos/ClienteProveedorDto.dto";

const FileUploadDropZone = dynamic(
  () =>
    import("@/core/shared/components/Files/UploadFileDropzone").then((mod) => ({
      default: mod.FileUploadDropZone,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

interface ClienteProveedorDetailSheetProps {
  clienteProveedor: ClienteProveedorDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tipoLabels: Record<ClienteProveedorDto["tipo"], string> = {
  cliente: "Cliente",
  proveedor: "Proveedor",
};

// ─── InfoRow ────────────────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn("text-sm font-medium break-words", mono && "font-mono")}
      >
        {value || "—"}
      </span>
    </div>
  );
}

// ─── SectionHeader ──────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
      {title}
    </h4>
  );
}

// ─── InformacionTab ─────────────────────────────────────────────────────────
function InformacionTab({
  clienteProveedor,
}: {
  clienteProveedor: ClienteProveedorDto;
}) {
  const formatDate = (d: string | null | undefined) => {
    if (!d) return null;
    try {
      return format(new Date(d), "d MMM yyyy", { locale: es });
    } catch {
      return null;
    }
  };

  const formatDateTime = (d: string | null | undefined) => {
    if (!d) return null;
    try {
      return format(new Date(d), "d MMM yyyy HH:mm", { locale: es });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Identificación */}
      <div>
        <SectionHeader title="Identificación" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Tipo" value={tipoLabels[clienteProveedor.tipo]} />
          <InfoRow label="RFC" value={clienteProveedor.rfc} mono />
          <InfoRow
            label="Estado"
            value={clienteProveedor.activo ? "Activo" : "Inactivo"}
          />
          <InfoRow
            label="Fecha de Registro"
            value={formatDate(clienteProveedor.fechaRegistro)}
          />
        </div>
      </div>

      <Separator />

      {/* Contacto */}
      <div>
        <SectionHeader title="Contacto" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Nombre" value={clienteProveedor.nombre} />
          <InfoRow label="Email" value={clienteProveedor.email} />
          <InfoRow label="Teléfono" value={clienteProveedor.telefono} />
          <InfoRow label="Contacto" value={clienteProveedor.contacto} />
        </div>
      </div>

      <Separator />

      {/* Datos Bancarios */}
      <div>
        <SectionHeader title="Datos Bancarios" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Banco" value={clienteProveedor.banco} />
          <InfoRow label="No. Cuenta" value={clienteProveedor.numeroCuenta} />
          <InfoRow
            label="CLABE Interbancaria"
            value={clienteProveedor.clabe}
            mono
          />
        </div>
      </div>

      <Separator />

      {/* Dirección */}
      <div>
        <SectionHeader title="Dirección" />
        <div className="grid grid-cols-1 gap-4">
          <InfoRow label="Dirección" value={clienteProveedor.direccion} />
        </div>
      </div>

      {/* Socio Responsable */}
      {clienteProveedor.socioResponsable && (
        <>
          <Separator />

          <div>
            <SectionHeader title="Socio Responsable" />
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                label="Nombre"
                value={clienteProveedor.socioResponsable.nombre}
              />
            </div>
          </div>
        </>
      )}

      {/* Notas */}
      {clienteProveedor.notas && (
        <>
          <Separator />

          <div>
            <SectionHeader title="Notas" />
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {clienteProveedor.notas}
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
            label="Ingresado por"
            value={clienteProveedor.ingresadoPorNombre}
          />
          <InfoRow
            label="Fecha de registro"
            value={formatDateTime(clienteProveedor.createdAt)}
          />
          <InfoRow
            label="Última actualización"
            value={formatDateTime(clienteProveedor.updatedAt)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── FilesTab ───────────────────────────────────────────────────────────────
function FilesTab({
  clienteProveedorId,
  isActive,
}: {
  clienteProveedorId: string;
  isActive: boolean;
}) {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["cliente-proveedor-files", clienteProveedorId],
    queryFn: async () => {
      const result = await getFilesByEntityAction(
        "CLIENTE_PROVEEDOR",
        clienteProveedorId,
      );
      if (result.ok && result.data) return result.data;
      return [];
    },
    enabled: isActive,
    staleTime: 30_000,
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["cliente-proveedor-files", clienteProveedorId],
    });
  };

  return (
    <div className="space-y-4">
      <FileUploadDropZone
        entityType="CLIENTE_PROVEEDOR"
        entityId={clienteProveedorId}
        onUploadSuccess={handleUploadSuccess}
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner className="size-6" />
        </div>
      ) : (
        <FileList
          files={files}
          entityType="CLIENTE_PROVEEDOR"
          onFileDeleted={handleUploadSuccess}
        />
      )}
    </div>
  );
}

// ─── HistorialTab ───────────────────────────────────────────────────────────
function HistorialTab({
  clienteProveedorId,
  isActive,
}: {
  clienteProveedorId: string;
  isActive: boolean;
}) {
  const {
    data: historial,
    isLoading,
    isError,
    error,
    refetch,
  } = useClienteProveedorHistorial(clienteProveedorId, isActive);

  const formatFecha = (fechaString: string) => {
    try {
      return format(new Date(fechaString), "d MMM yyyy HH:mm", { locale: es });
    } catch {
      return fechaString;
    }
  };

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
          No hay historial de cambios para este cliente/proveedor
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
                Campo modificado:
              </span>{" "}
              <span className="font-semibold">
                {formatFieldName(item.campo)}
              </span>
            </TimelineTitle>
          </TimelineHeader>
          <TimelineContent className="mt-2 rounded-lg border px-4 py-3 text-foreground bg-muted/30">
            <p className="text-sm leading-relaxed">
              {formatChangeDescription(
                item.campo,
                item.valorAnterior,
                item.valorNuevo,
              )}
            </p>
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

// ─── Main Component ─────────────────────────────────────────────────────────
export function ClienteProveedorDetailSheet({
  clienteProveedor,
  open,
  onOpenChange,
}: ClienteProveedorDetailSheetProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("info");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(["info"]),
  );

  useEffect(() => {
    setActiveTab("info");
    setVisitedTabs(new Set(["info"]));
  }, [clienteProveedor?.id, open]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => new Set([...prev, tab]));
  }, []);

  if (!clienteProveedor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "p-0 w-full sm:max-w-3xl",
          isMobile
            ? "rounded-t-3xl max-h-[92dvh] flex flex-col overflow-hidden"
            : "rounded-3xl overflow-y-auto",
        )}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold truncate">
                {clienteProveedor.nombre}
              </SheetTitle>

              {/* Badges: tipo + estado */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge
                  variant={
                    clienteProveedor.tipo === "cliente"
                      ? "default"
                      : "secondary"
                  }
                  className={cn(
                    "text-xs capitalize",
                    clienteProveedor.tipo === "cliente"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800",
                  )}
                >
                  {clienteProveedor.tipo}
                </Badge>
                <Badge
                  variant={clienteProveedor.activo ? "default" : "secondary"}
                  className={cn(
                    "text-xs",
                    clienteProveedor.activo
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800",
                  )}
                >
                  {clienteProveedor.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              {/* Meta: RFC + email */}
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                <span>
                  <span className="font-medium text-foreground">RFC:</span>{" "}
                  <span className="font-mono">{clienteProveedor.rfc}</span>
                </span>
                {clienteProveedor.email && (
                  <span className="truncate">
                    <span className="font-medium text-foreground">Email:</span>{" "}
                    {clienteProveedor.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">
                Información
              </TabsTrigger>
              <TabsTrigger value="archivos" className="flex-1">
                <span className="flex items-center gap-1.5">
                  <Paperclip className="size-3" />
                  Archivos
                </span>
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
              <InformacionTab clienteProveedor={clienteProveedor} />
            </TabsContent>

            {/* Archivos — lazy */}
            <TabsContent value="archivos" className="mt-5">
              {(activeTab === "archivos" || visitedTabs.has("archivos")) && (
                <FilesTab
                  clienteProveedorId={clienteProveedor.id}
                  isActive={activeTab === "archivos"}
                />
              )}
            </TabsContent>

            {/* Historial — lazy */}
            <TabsContent value="historial" className="mt-5">
              {(activeTab === "historial" || visitedTabs.has("historial")) && (
                <HistorialTab
                  clienteProveedorId={clienteProveedor.id}
                  isActive={activeTab === "historial"}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
