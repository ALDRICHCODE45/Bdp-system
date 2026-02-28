"use client";

import { useState, useCallback } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/shared/ui/tooltip";

import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { FileList } from "@/core/shared/components/Files/FileList";
import { getFilesByEntityAction } from "@/features/Files/server/actions/getFilesByEntityAction";

import { useFacturaHistorial } from "../hooks/useFacturaHistorial.hook";
import { getCurrencyFormatter } from "./FacturasTableColumns";
import { FacturaStatusBadge } from "./FacturaStatusBadge";
import { cn } from "@/core/lib/utils";
import { formatFieldName } from "../helpers/formatHistorialField";
import { formatChangeDescription } from "../helpers/formatHistorialChange";
import { History, AlertCircle, Copy, Check, Paperclip } from "lucide-react";
import type { FacturaDto } from "../server/dtos/FacturaDto.dto";

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

interface FacturaDetailSheetProps {
  factura: FacturaDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusPagoColors: Record<string, string> = {
  Vigente:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200",
  Cancelado:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200",
  NoPagado:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-200",
};

const statusPagoLabels: Record<string, string> = {
  NoPagado: "No Pagado",
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
      <span className={cn("text-sm font-medium", mono && "font-mono")}>
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

// ─── CopyUUID ───────────────────────────────────────────────────────────────
function CopyUUID({ uuid }: { uuid: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(uuid).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">UUID</span>
      <div className="flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm font-medium font-mono truncate max-w-[160px] cursor-default">
              {uuid}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">{uuid}</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 shrink-0"
          onClick={handleCopy}
          aria-label="Copiar UUID"
        >
          {copied ? (
            <Check className="size-3 text-emerald-500" />
          ) : (
            <Copy className="size-3 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── InformacionTab ──────────────────────────────────────────────────────────
function InformacionTab({ factura }: { factura: FacturaDto }) {
  const fmt = getCurrencyFormatter(factura.moneda);

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
          <CopyUUID uuid={factura.uuid} />
          <InfoRow label="Uso CFDI" value={factura.usoCfdi} />
          <InfoRow label="Serie" value={factura.serie} mono />
          <InfoRow label="Folio" value={factura.folio} mono />
          <InfoRow label="Método de Pago" value={factura.metodoPago} />
          <InfoRow label="Moneda" value={factura.moneda} />
        </div>
      </div>

      <Separator />

      {/* Emisor */}
      <div>
        <SectionHeader title="Emisor" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="RFC" value={factura.rfcEmisor} mono />
          <InfoRow label="Nombre" value={factura.nombreEmisor} />
        </div>
      </div>

      <Separator />

      {/* Receptor */}
      <div>
        <SectionHeader title="Receptor" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="RFC" value={factura.rfcReceptor} mono />
          <InfoRow label="Nombre" value={factura.nombreReceptor} />
        </div>
      </div>

      <Separator />

      {/* Importes */}
      <div>
        <SectionHeader title="Importes" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Subtotal" value={fmt.format(factura.subtotal)} />
          <InfoRow label="Total" value={fmt.format(factura.total)} />
          <InfoRow
            label="Imp. Trasladados"
            value={
              factura.totalImpuestosTransladados !== null
                ? fmt.format(factura.totalImpuestosTransladados)
                : null
            }
          />
          <InfoRow
            label="Imp. Retenidos"
            value={
              factura.totalImpuestosRetenidos !== null
                ? fmt.format(factura.totalImpuestosRetenidos)
                : null
            }
          />
        </div>
      </div>

      <Separator />

      {/* Pago */}
      <div>
        <SectionHeader title="Pago" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow
            label="Estado de Pago"
            value={
              factura.statusPago
                ? (statusPagoLabels[factura.statusPago] ?? factura.statusPago)
                : null
            }
          />
          <InfoRow
            label="Fecha de Pago"
            value={formatDate(factura.fechaPago)}
          />
        </div>
      </div>

      <Separator />

      {/* Auditoría */}
      <div>
        <SectionHeader title="Auditoría" />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Ingresado por" value={factura.ingresadoPorNombre} />
          <InfoRow
            label="Fecha de registro"
            value={formatDateTime(factura.createdAt)}
          />
          <InfoRow
            label="Última actualización"
            value={formatDateTime(factura.updatedAt)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── FilesTab ────────────────────────────────────────────────────────────────
function FilesTab({
  facturaId,
  isActive,
}: {
  facturaId: string;
  isActive: boolean;
}) {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["factura-files", facturaId],
    queryFn: async () => {
      const result = await getFilesByEntityAction("FACTURA", facturaId);
      if (result.ok && result.data) return result.data;
      return [];
    },
    enabled: isActive,
    staleTime: 30_000,
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["factura-files", facturaId] });
  };

  return (
    <div className="space-y-4">
      <FileUploadDropZone
        entityType="FACTURA"
        entityId={facturaId}
        onUploadSuccess={handleUploadSuccess}
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner className="size-6" />
        </div>
      ) : (
        <FileList
          files={files}
          entityType="FACTURA"
          onFileDeleted={handleUploadSuccess}
        />
      )}
    </div>
  );
}

// ─── HistorialTab ────────────────────────────────────────────────────────────
function HistorialTab({
  facturaId,
  isActive,
}: {
  facturaId: string;
  isActive: boolean;
}) {
  const {
    data: historial,
    isLoading,
    isError,
    error,
    refetch,
  } = useFacturaHistorial(facturaId, isActive);

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
          No hay historial de cambios para esta factura
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

// ─── Main Component ──────────────────────────────────────────────────────────
export function FacturaDetailSheet({
  factura,
  open,
  onOpenChange,
}: FacturaDetailSheetProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("info");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(["info"]),
  );

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => new Set([...prev, tab]));
  }, []);

  if (!factura) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="rounded-3xl overflow-y-auto p-0 w-full sm:max-w-3xl"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold truncate">
                {factura.concepto}
              </SheetTitle>

              {/* Badges: status + statusPago + moneda */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <FacturaStatusBadge status={factura.status} />
                {factura.statusPago && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      statusPagoColors[factura.statusPago],
                    )}
                  >
                    {statusPagoLabels[factura.statusPago] ?? factura.statusPago}
                  </Badge>
                )}
                <Badge variant="outline" className="font-mono text-xs">
                  {factura.moneda}
                </Badge>
              </div>

              {/* Meta: emisor + receptor */}
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                {factura.nombreEmisor && (
                  <span>
                    <span className="font-medium text-foreground">Emisor:</span>{" "}
                    {factura.nombreEmisor}
                  </span>
                )}
                {factura.nombreReceptor && (
                  <span>
                    <span className="font-medium text-foreground">
                      Receptor:
                    </span>{" "}
                    {factura.nombreReceptor}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex-1 px-6 py-4">
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
              <InformacionTab factura={factura} />
            </TabsContent>

            {/* Archivos — lazy */}
            <TabsContent value="archivos" className="mt-5">
              {(activeTab === "archivos" || visitedTabs.has("archivos")) && (
                <FilesTab
                  facturaId={factura.id}
                  isActive={activeTab === "archivos"}
                />
              )}
            </TabsContent>

            {/* Historial — lazy */}
            <TabsContent value="historial" className="mt-5">
              {(activeTab === "historial" || visitedTabs.has("historial")) && (
                <HistorialTab
                  facturaId={factura.id}
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
