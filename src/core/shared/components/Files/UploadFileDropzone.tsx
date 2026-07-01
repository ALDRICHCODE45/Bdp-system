"use client";

import { Upload, X, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/core/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Calendar } from "@/core/shared/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/shared/ui/popover";
import { Label } from "@/core/shared/ui/label";
import { cn } from "@/core/lib/utils";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/core/shared/ui/file-upload";
import { useCallback, useMemo, useState } from "react";
import { uploadFileAction } from "@/features/Files/server/actions/uploadFileAction";

/**
 * P5 — widened to include COLABORADOR (cap12 req1).
 *
 * COLABORADOR-specific features (cap8 req2/3, cap10 req1):
 *  - `enableCategory` — renders a category select (DocumentCategory enum).
 *  - `enableExpiryDate` — renders an expiry date picker (CC9).
 *  - `acceptedMimeTypes` — restricts MIME; non-matching files are rejected
 *    with `mimeRejectionMessage` (used by the CV tab for PDF-only).
 *
 * Both the category and the expiryDate apply to the WHOLE upload batch
 * (single select / picker below the dropzone). This is intentional and
 * matches the cap8 scenario wording — "category persists and is filterable",
 * not "every file in the batch has its own category".
 */
interface FileUploadDropZoneProps {
  entityType:
    | "FACTURA"
    | "MOVIMIENTO"
    | "CLIENTE_PROVEEDOR"
    | "COLABORADOR";
  entityId: string;
  onUploadSuccess?: () => void;
  maxFiles?: number;
  maxSize?: number; // en bytes
  enableCategory?: boolean;
  enableExpiryDate?: boolean;
  acceptedMimeTypes?: string[];
  mimeRejectionMessage?: string;
}

const DOCUMENT_CATEGORY_OPTIONS = [
  { value: "CONTRATO", label: "Contrato" },
  { value: "INE", label: "INE" },
  { value: "RFC", label: "RFC" },
  { value: "COMPROBANTE_DOMICILIO", label: "Comprobante de domicilio" },
  { value: "OTRO", label: "Otro" },
] as const;

export function FileUploadDropZone({
  entityType,
  entityId,
  onUploadSuccess,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  enableCategory = false,
  enableExpiryDate = false,
  acceptedMimeTypes,
  mimeRejectionMessage,
}: FileUploadDropZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // COLABORADOR-only batch-level inputs. The default "OTRO" keeps the action
  // call type-safe even if the user submits without picking a category.
  const [category, setCategory] = useState<string>("OTRO");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

  const isColaborador = entityType === "COLABORADOR";
  const showCategory = isColaborador && enableCategory;
  const showExpiryDate = isColaborador && enableExpiryDate;

  // `accept` string consumed by `FileUpload`. When `acceptedMimeTypes` is
  // provided we use it verbatim; otherwise we fall back to the default
  // "everything" set baked into the underlying UI.
  const acceptAttr = useMemo(() => {
    if (acceptedMimeTypes && acceptedMimeTypes.length > 0) {
      return acceptedMimeTypes.join(",");
    }
    return undefined;
  }, [acceptedMimeTypes]);

  const onFileReject = useCallback(
    (file: File, message: string) => {
      // Override the message when the rejection came from a MIME filter we
      // applied. We re-derive it here rather than trust the library so the
      // user sees the friendly custom string we promised (e.g. CV → PDF only).
      const matchedByMime =
        acceptedMimeTypes &&
        acceptedMimeTypes.length > 0 &&
        !acceptedMimeTypes.includes(file.type);
      const finalMessage =
        matchedByMime && mimeRejectionMessage ? mimeRejectionMessage : message;
      toast.error(finalMessage, {
        description: `"${
          file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
        }" ha sido rechazado`,
      });
    },
    [acceptedMimeTypes, mimeRejectionMessage]
  );

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("No hay archivos para subir");
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        // Defense-in-depth: even though the FileUpload component already
        // filtered by `accept`, re-check the MIME here so a CV-only tab
        // cannot be tricked by a server-side test into a 415-style failure
        // when the front-end filter is bypassed.
        if (
          acceptedMimeTypes &&
          acceptedMimeTypes.length > 0 &&
          !acceptedMimeTypes.includes(file.type)
        ) {
          toast.error(
            mimeRejectionMessage || `Tipo de archivo no permitido (${file.type})`
          );
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("entityType", entityType);
        formData.append("entityId", entityId);

        // Only attach category/expiryDate when COLABORADOR and the feature
        // is enabled. This keeps the FormData payload minimal for the
        // existing entityTypes (cap12 req3 — no regression).
        if (showCategory && category) {
          formData.append("category", category);
        }
        if (showExpiryDate && expiryDate) {
          // YYYY-MM-DD so the server can `new Date()` it without TZ drift.
          formData.append(
            "expiryDate",
            format(expiryDate, "yyyy-MM-dd")
          );
        }

        const result = await uploadFileAction(formData);

        if (!result.ok) {
          toast.error(result.error || `Error al subir ${file.name}`);
        }
      }

      toast.success("Archivos subidos correctamente");
      setFiles([]);
      setExpiryDate(undefined);
      onUploadSuccess?.();
    } catch {
      toast.error("Error al subir los archivos");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <FileUpload
        maxFiles={maxFiles}
        maxSize={maxSize}
        accept={acceptAttr}
        className="w-full"
        value={files}
        onValueChange={setFiles}
        onFileReject={onFileReject}
        multiple
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">
              Arrastra y suelta tus archivos aquí
            </p>
            <p className="text-muted-foreground text-xs">
              O haz clic para buscar (máx. {maxFiles} archivos, hasta{" "}
              {Math.round(maxSize / 1024 / 1024)} MB cada uno)
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {acceptedMimeTypes && acceptedMimeTypes.length > 0
                ? `Formatos permitidos: ${acceptedMimeTypes
                    .map(prettyMime)
                    .join(", ")}`
                : "Formatos permitidos: PDF, XML, Excel, Word"}
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Buscar archivos
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file}>
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <X />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>

      {/* COLABORADOR-only metadata inputs (cap8 req2/3). These apply to the
          whole batch; if the user needs per-file metadata they can upload
          one file at a time. */}
      {showCategory || showExpiryDate ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {showCategory ? (
            <div className="space-y-1.5">
              <Label htmlFor="colaborador-file-category">Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="colaborador-file-category">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {showExpiryDate ? (
            <div className="space-y-1.5">
              <Label htmlFor="colaborador-file-expiry">Fecha de vencimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="colaborador-file-expiry"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? (
                      format(expiryDate, "dd/MM/yyyy", { locale: es })
                    ) : (
                      <span>Sin vencimiento</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : null}
        </div>
      ) : null}

      {files.length > 0 && (
        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? "Subiendo..." : `Subir ${files.length} archivo(s)`}
        </Button>
      )}
    </div>
  );
}

/**
 * Friendly label for a MIME type string, used in the dropzone hint text.
 */
function prettyMime(mime: string): string {
  switch (mime) {
    case "application/pdf":
      return "PDF";
    case "application/xml":
    case "text/xml":
      return "XML";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "application/vnd.ms-excel":
      return "Excel";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/msword":
      return "Word";
    default:
      return mime;
  }
}