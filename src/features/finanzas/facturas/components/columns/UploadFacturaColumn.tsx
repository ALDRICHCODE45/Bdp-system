"use client";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { Button } from "@/core/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/shared/ui/dialog";
import { FolderUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFilesByEntityAction } from "@/features/Files/server/actions/getFilesByEntityAction";
import { FileList } from "@/core/shared/components/Files/FileList";

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

interface UploadFacturaColumnProps {
  facturaId: string;
}

export const UploadFacturaColumn = ({
  facturaId,
}: UploadFacturaColumnProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Only fetch when the dialog is open — enabled: isOpen.
  // TanStack Query handles caching, deduplication, and re-fetching automatically.
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["factura-files", facturaId],
    queryFn: async () => {
      const result = await getFilesByEntityAction("FACTURA", facturaId);
      if (result.ok && result.data) return result.data;
      return [];
    },
    enabled: isOpen,
    staleTime: 30_000,
  });

  const handleUploadSuccess = () => {
    // Invalidate to refresh the file list after a successful upload/delete.
    queryClient.invalidateQueries({ queryKey: ["factura-files", facturaId] });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          buttonTooltip
          buttonTooltipText="Subir archivos"
          size={"icon"}
        >
          <FolderUp />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Archivos de la factura</DialogTitle>
          <DialogDescription>
            Sube y gestiona los archivos relacionados con esta factura (PDF,
            XML, Excel, Word)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FileUploadDropZone
            entityType="FACTURA"
            entityId={facturaId}
            onUploadSuccess={handleUploadSuccess}
          />
          {isLoading ? (
            <LoadingModalState />
          ) : (
            <FileList
              files={files}
              entityType="FACTURA"
              onFileDeleted={handleUploadSuccess}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
