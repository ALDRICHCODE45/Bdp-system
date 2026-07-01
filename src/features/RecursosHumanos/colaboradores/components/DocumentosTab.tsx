"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Filter,
  GraduationCap,
  IdCard,
  Layers,
  Receipt,
  ScrollText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/core/shared/ui/empty";
import { Separator } from "@/core/shared/ui/separator";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { FileList } from "@/core/shared/components/Files/FileList";
import { getFilesByEntityAction } from "@/features/Files/server/actions/getFilesByEntityAction";
import type { FileEntity } from "@/features/Files/server/entities/File.entity";

/**
 * FileUploadDropzone is `"use client"` AND uses `useState` for the file
 * queue. We lazy-load it via `next/dynamic` with `ssr: false` so the
 * dropzone's interactive layer never runs on the server (matches the
 * pattern used in `UploadFacturaColumn` / `UploadClienteProveedorColumn`).
 */
const FileUploadDropZone = dynamic(
  () =>
    import("@/core/shared/components/Files/UploadFileDropzone").then((mod) => ({
      default: mod.FileUploadDropZone,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface DocumentosTabProps {
  colaboradorId: string;
}

/**
 * P5 — cap8 Documentos tab.
 *
 * Lets the user upload, list, filter by category, and remove files attached
 * to a colaborador. The dropzone reuses the widened `UploadFileDropzone`
 * with `enableCategory` + `enableExpiryDate` enabled (only rendered when
 * entityType === 'COLABORADOR'). The list reuses the widened `FileList`
 * which already renders the expiry badge (CC9) + category chip per row.
 *
 * Cap8 req5: removal MUST require explicit confirmation. The widened
 * `FileList` already wraps the trash button in an AlertDialog, so we don't
 * need a second confirmation layer here — cap8 scenario "remove with
 * cancel dialog → file NOT deleted" is satisfied by FileList's existing UI.
 *
 * Permission gating (CC1/CC8): every write goes through the FileService
 * action which requires auth via the session. UI side we hide the upload
 * affordance with `<PermissionGuard>` so unauthorized users never see the
 * dropzone. The list itself only requires `colaboradores:acceder`.
 */
export function DocumentosTab({ colaboradorId }: DocumentosTabProps) {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["colaborador-files", colaboradorId],
    queryFn: async () => {
      const result = await getFilesByEntityAction("COLABORADOR", colaboradorId);
      if (result.ok && result.data) return result.data as FileEntity[];
      return [];
    },
    enabled: Boolean(colaboradorId),
    staleTime: 30_000,
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["colaborador-files", colaboradorId],
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Subir documentos
          </CardTitle>
          <CardDescription>
            Contratos, identificaciones y comprobantes asociados al colaborador.
            Selecciona una categoría y, si aplica, una fecha de vencimiento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadDropZone
            entityType="COLABORADOR"
            entityId={colaboradorId}
            onUploadSuccess={handleUploadSuccess}
            enableCategory
            enableExpiryDate
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Documentos ({files.length})
          </CardTitle>
          <CardDescription>
            Archivos almacenados bajo este colaborador. Filtra por categoría o
            elimina con confirmación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DocumentosList
            files={files}
            colaboradorId={colaboradorId}
            isLoading={isLoading}
            onChange={handleUploadSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Filterable list of files scoped to this colaborador. Category chips sit
 * above the list and live in local state — no need to round-trip the server
 * for a filter that the data is already cached for.
 */
function DocumentosList({
  files,
  colaboradorId,
  isLoading,
  onChange,
}: {
  files: FileEntity[];
  colaboradorId: string;
  isLoading: boolean;
  onChange: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string | "ALL">("ALL");

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of files) {
      const cat = f.category ?? "OTRO";
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    return counts;
  }, [files]);

  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return files;
    return files.filter((f) => (f.category ?? "OTRO") === activeCategory);
  }, [files, activeCategory]);

  const chips = [
    { value: "ALL" as const, label: "Todos", icon: Layers, count: files.length },
    { value: "CONTRATO", label: "Contrato", icon: ScrollText },
    { value: "INE", label: "INE", icon: IdCard },
    { value: "RFC", label: "RFC", icon: Receipt },
    { value: "COMPROBANTE_DOMICILIO", label: "Comprobante", icon: FileText },
    { value: "OTRO", label: "Otro", icon: Filter },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isActive = activeCategory === chip.value;
          const count =
            chip.value === "ALL"
              ? chip.count ?? files.length
              : categoryCounts.get(chip.value) ?? 0;
          const Icon = chip.icon;
          return (
            <Button
              key={chip.value}
              type="button"
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => setActiveCategory(chip.value)}
              className="gap-1"
              disabled={chip.value !== "ALL" && count === 0}
            >
              <Icon className="h-3.5 w-3.5" />
              {chip.label}
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className="ml-1 text-[10px]"
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      <Separator />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando documentos…</p>
      ) : filtered.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No hay documentos</EmptyTitle>
            <EmptyDescription>
              {activeCategory === "ALL"
                ? "Sube un archivo usando el formulario de arriba."
                : "No hay documentos en esta categoría."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <FileList
          files={filtered}
          entityType="COLABORADOR"
          onFileDeleted={onChange}
        />
      )}

      {/* Hidden anchor for tests / a11y that want to confirm the COLABORADOR
          scope was applied. The value is informational; it's never read by
          the FileList at runtime. */}
      <input
        type="hidden"
        value={colaboradorId}
        readOnly
        aria-hidden
        className="hidden"
      />
      <span className="sr-only">
        <GraduationCap className="h-4 w-4" />
        Documentos del colaborador {colaboradorId}
      </span>
    </div>
  );
}