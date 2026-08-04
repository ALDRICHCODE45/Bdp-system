"use client";

import { Loader2, Download, FileSpreadsheet, FileText } from "lucide-react";

import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";

interface ExportActionsProps {
  /** Triggered when the user selects Excel export. */
  onExportExcel: () => void;
  /** Triggered when the user selects PDF export. */
  onExportPDF: () => void;
  /** Disables both items while an export is in flight. */
  isExporting: boolean;
  /** Optional result count shown in the trigger label. */
  resultCount?: number;
  /** Override the trigger label (default: "Exportar"). */
  triggerLabel?: string;
  /** Disable the PDF option independently (e.g. when no data yet). */
  disablePDF?: boolean;
}

/**
 * Shared export dropdown. Used by the reporte de horas toolbar and available
 * to any feature that exposes Excel + PDF downloads. Wraps the two export
 * actions in a single DropdownMenu so the toolbar stays compact.
 */
export function ExportActions({
  onExportExcel,
  onExportPDF,
  isExporting,
  resultCount,
  triggerLabel = "Exportar",
  disablePDF = false,
}: ExportActionsProps) {
  const isDisabled = isExporting;
  const pdfDisabled = isExporting || disablePDF;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isDisabled}
          aria-label="Abrir menú de exportación"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>{triggerLabel}</span>
          {typeof resultCount === "number" && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {resultCount.toLocaleString("es-MX")}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {typeof resultCount === "number"
            ? `${resultCount.toLocaleString("es-MX")} grupos`
            : "Formato de exportación"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            onExportExcel();
          }}
          disabled={isDisabled}
        >
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          <span>Excel (todos los grupos)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            onExportPDF();
          }}
          disabled={pdfDisabled}
        >
          <FileText className="h-4 w-4 text-red-600" />
          <span>Resumen PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
