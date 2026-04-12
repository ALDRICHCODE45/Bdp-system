"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/core/shared/ui/tabs";
import { Spinner } from "@/core/shared/ui/spinner";
import { Paperclip } from "lucide-react";

import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { FileList } from "@/core/shared/components/Files/FileList";
import { getFilesByEntityAction } from "@/features/Files/server/actions/getFilesByEntityAction";

import { EditFacturaForm } from "./forms/EditFacturaForm";
import { FacturaStatusBadge } from "./FacturaStatusBadge";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { isWithin24Hours } from "../helpers/capturadorUtils";

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

interface EditFacturaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  factura: FacturaDto | null;
  isCapturador?: boolean;
}

// ─── Files Tab ───────────────────────────────────────────────────────────────
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

// ─── Main Component ──────────────────────────────────────────────────────────
export function EditFacturaSheet({
  isOpen,
  onClose,
  factura,
  isCapturador = false,
}: EditFacturaSheetProps) {
  const isMobile = useIsMobile();
  const isEditable = factura
    ? isWithin24Hours(new Date(factura.createdAt))
    : false;
  const [activeTab, setActiveTab] = useState("datos");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(["datos"]),
  );

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => new Set([...prev, tab]));
  }, []);

  if (!factura) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className=" ml-0 rounded-2xl overflow-y-auto p-0 w-full sm:max-w-2xl"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Editar factura
              </p>
              <SheetTitle className="text-lg font-semibold truncate leading-tight">
                {factura.concepto}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {!isCapturador && (
                  <FacturaStatusBadge status={factura.status} />
                )}
                <span className="font-mono text-xs text-muted-foreground border rounded px-1.5 py-0.5">
                  {factura.moneda}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="px-6 py-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="datos" className="flex-1">
                Datos
              </TabsTrigger>
              {!isCapturador && (
                <TabsTrigger value="archivos" className="flex-1">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="size-3" />
                    Archivos
                  </span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Datos */}
            <TabsContent value="datos" className="mt-5">
              <EditFacturaForm
                factura={factura}
                onSuccess={onClose}
                isCapturador={isCapturador}
                isEditable={isCapturador ? isEditable : true}
              />
            </TabsContent>

            {/* Archivos — lazy, oculto para capturador */}
            {!isCapturador && (
              <TabsContent value="archivos" className="mt-5">
                {(activeTab === "archivos" || visitedTabs.has("archivos")) && (
                  <FilesTab
                    facturaId={factura.id}
                    isActive={activeTab === "archivos"}
                  />
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
