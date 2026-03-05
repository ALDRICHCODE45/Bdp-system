"use client";

import { useEffect, useRef, useState } from "react";
import { useFileUpload, formatBytes, type FileWithPreview } from "@/core/shared/hooks/use-upload-file";
import { uploadToSpacesAction } from "@/features/Files/server/actions/uploadToSpacesAction";
import { cn } from "@/core/lib/utils";
import {
  UploadCloud,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Button } from "@/core/shared/ui/button";

interface FacturaSATUploadProps {
  /** URL actual (si la factura ya tiene un PDF subido) */
  value?: string;
  /** Callback cuando se obtiene la URL pública tras subir el archivo */
  onChange: (url: string) => void;
  /** Callback cuando se elimina el archivo */
  onClear?: () => void;
  disabled?: boolean;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export function FacturaSATUpload({
  value,
  onChange,
  onClear,
  disabled = false,
}: FacturaSATUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Ref para evitar stale closure en onFilesAdded
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [
    { files, isDragging, errors },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, getInputProps, clearFiles },
  ] = useFileUpload({
    accept: "application/pdf,.pdf",
    maxSize: MAX_SIZE,
    multiple: false,
  });

  // Reaccionar cuando se agrega un archivo nuevo
  useEffect(() => {
    const item = files[0];
    if (!item || !(item.file instanceof File)) return;

    let cancelled = false;

    const upload = async (fileWithPreview: FileWithPreview) => {
      setUploadError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", fileWithPreview.file as File);
        formData.append("folder", "facturas");

        const result = await uploadToSpacesAction(formData);

        if (cancelled) return;

        if (!result.ok) {
          setUploadError(result.error);
          clearFiles();
        } else {
          onChangeRef.current(result.url);
        }
      } catch {
        if (!cancelled) {
          setUploadError("Error inesperado al subir el archivo.");
          clearFiles();
        }
      } finally {
        if (!cancelled) setUploading(false);
      }
    };

    upload(item);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleRemove = () => {
    clearFiles();
    setUploadError(null);
    onClear?.();
    onChangeRef.current("");
  };

  const inputProps = getInputProps();
  const pendingFile = files[0];
  const inputId = "factura-sat-input";

  // ── Estado: URL confirmada ────────────────────────────────────────────────
  if (value && !uploading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            PDF timbrado subido
          </p>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <ExternalLink className="size-3 shrink-0" />
            <span className="truncate max-w-[280px] block">{value}</span>
          </a>
        </div>
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-emerald-700 hover:text-destructive hover:bg-destructive/10"
            onClick={handleRemove}
            aria-label="Quitar archivo"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    );
  }

  // ── Estado: subiendo ──────────────────────────────────────────────────────
  if (uploading && pendingFile) {
    const file = pendingFile.file as File;
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileText className="size-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full animate-[shimmer_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 bg-[length:200%_100%]" />
          </div>
          <p className="text-xs text-muted-foreground">
            Subiendo a Digital Ocean Spaces…
          </p>
        </div>
        <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Estado: dropzone ──────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200",
          "cursor-pointer select-none",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        {/* Ícono */}
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-xl border transition-colors duration-200",
            isDragging
              ? "border-primary/40 bg-primary/10"
              : "border-border bg-background group-hover:border-primary/30 group-hover:bg-primary/5"
          )}
        >
          <UploadCloud
            className={cn(
              "size-5 transition-colors duration-200",
              isDragging
                ? "text-primary"
                : "text-muted-foreground group-hover:text-primary/70"
            )}
          />
        </div>

        {/* Texto */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {isDragging
              ? "Soltá el PDF acá"
              : "Arrastrá o seleccioná el PDF timbrado"}
          </p>
          <p className="text-xs text-muted-foreground">
            Solo archivos{" "}
            <span className="font-medium text-foreground">PDF</span> · máx.{" "}
            {formatBytes(MAX_SIZE)}
          </p>
        </div>

        {/* Input oculto */}
        <input
          {...inputProps}
          id={inputId}
          className="sr-only"
          disabled={disabled}
        />
      </label>

      {/* Errores */}
      {(errors.length > 0 || uploadError) && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <AlertCircle className="size-3.5 mt-0.5 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">
            {uploadError ?? errors[0]}
          </p>
        </div>
      )}
    </div>
  );
}
