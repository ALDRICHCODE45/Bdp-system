"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  RefreshCcw,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/shared/ui/accordion";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import { ScrollArea } from "@/core/shared/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/shared/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/shared/ui/tabs";
import { cn } from "@/core/lib/utils";
import {
  GenericImportDialog,
  useImportState,
} from "@/core/shared/excel-import";
import { useImportMovimientosExecute } from "../hooks/useImportMovimientosExecute.hook";
import { useImportMovimientosPreview } from "../hooks/useImportMovimientosPreview.hook";
import type { MovimientoImportPreviewDto } from "../server/dtos/MovimientoImportPreviewDto.dto";
import type { MovimientoImportResultDto } from "../server/dtos/MovimientoImportResultDto.dto";
import type { MovimientoImportRowDto } from "../server/dtos/MovimientoImportRowDto.dto";

interface ImportMovimientosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const tipoBadgeClass: Record<string, string> = {
  INGRESO:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0",
  EGRESO:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0",
};

const statusBadgeClass: Record<string, string> = {
  created:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0",
  error:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0",
  skipped:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-0",
  updated:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0",
};

/** Format an ISO date string as "d MMM yyyy" in UTC (date-only, no tz drift). */
const utcDateFormatter = new Intl.DateTimeFormat("es-MX", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  try {
    return utcDateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function getCargoAbonoLabel(tipo: string) {
  return tipo === "INGRESO" ? "Abono" : "Cargo";
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4 pb-0">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-0 text-xs text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
}

function PreviewRowsTable({
  rows,
  statusLabel,
  statusClassName,
}: {
  rows: MovimientoImportRowDto[];
  statusLabel: string;
  statusClassName: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No hay filas en esta categoría.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[320px] rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fila</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cargo / Abono</TableHead>
            <TableHead>Fecha op.</TableHead>
            <TableHead>Fecha corte</TableHead>
            <TableHead>Descripción / concepto</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Titular</TableHead>
            <TableHead>Edo. cta.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={`${statusLabel}-${row.dedupHash}-${row.sourceRowNumber}`}
            >
              <TableCell className="font-mono text-xs">
                {row.sourceRowNumber}
              </TableCell>
              <TableCell>
                <Badge className={statusClassName}>{statusLabel}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", tipoBadgeClass[row.tipo] ?? "")}
                >
                  {row.tipo}
                </Badge>
              </TableCell>
              <TableCell className="text-xs">
                {getCargoAbonoLabel(row.tipo)}
              </TableCell>
              <TableCell className="text-xs">
                {formatDate(row.fechaOperacion)}
              </TableCell>
              <TableCell className="text-xs">
                {formatDate(row.fechaCorte)}
              </TableCell>
              <TableCell className="max-w-[280px] whitespace-normal text-xs">
                {row.descripcionLiteral}
              </TableCell>
              <TableCell
                className={cn(
                  "text-xs tabular-nums",
                  row.tipo === "INGRESO" && "font-semibold",
                  row.tipo === "EGRESO" && "text-red-600 dark:text-red-400",
                )}
              >
                {currencyFormatter.format(row.monto)}
              </TableCell>
              <TableCell className="text-xs">{row.titular}</TableCell>
              <TableCell className="text-xs">{row.estadoCuenta}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

function PreviewErrorsTable({
  preview,
}: {
  preview: MovimientoImportPreviewDto;
}) {
  if (preview.errores.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No hay errores de validación.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[320px] rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fila</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Campo</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preview.errores.flatMap((rowError) =>
            rowError.errors.map((error, index) => (
              <TableRow key={`${rowError.rowNumber}-${error.field}-${index}`}>
                <TableCell className="font-mono text-xs">
                  {rowError.rowNumber}
                </TableCell>
                <TableCell>
                  <Badge className={statusBadgeClass.error}>Inválida</Badge>
                </TableCell>
                <TableCell className="text-xs">{error.field}</TableCell>
                <TableCell className="max-w-[480px] whitespace-normal text-xs text-red-700 dark:text-red-300">
                  {error.message}
                </TableCell>
              </TableRow>
            )),
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

function MovimientosImportPreview({
  preview,
}: {
  preview: MovimientoImportPreviewDto;
}) {
  const skippedRows =
    preview.resumen.totalRows -
    preview.resumen.nuevas -
    preview.resumen.duplicadas -
    preview.resumen.errores;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard
          title="Nuevas"
          value={preview.resumen.nuevas}
          description="Filas listas para importar."
        />
        <SummaryCard
          title="Duplicadas"
          value={preview.resumen.duplicadas}
          description="Coinciden con un movimiento existente."
        />
        <SummaryCard
          title="Errores"
          value={preview.resumen.errores}
          description="Requieren corregir el Excel antes de importar."
        />
        <SummaryCard
          title="Omitidas"
          value={Math.max(skippedRows, 0)}
          description="Filas vacías o marcadas como INICIO."
        />
      </div>

      <Card className="gap-3 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-base">Revisión de importación</CardTitle>
          <CardDescription>
            Encabezado detectado en fila {preview.headerRowDetectedAt ?? "—"}.
            La ejecución volverá a leer y validar el archivo desde el servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          <Tabs defaultValue="nuevas" className="gap-4">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="nuevas">
                Nuevas ({preview.nuevas.length})
              </TabsTrigger>
              <TabsTrigger value="duplicadas">
                Duplicadas ({preview.duplicadas.length})
              </TabsTrigger>
              <TabsTrigger value="errores">
                Errores ({preview.errores.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nuevas">
              <PreviewRowsTable
                rows={preview.nuevas}
                statusLabel="Nueva"
                statusClassName={statusBadgeClass.created}
              />
            </TabsContent>

            <TabsContent value="duplicadas">
              <PreviewRowsTable
                rows={preview.duplicadas.map((item) => item.row)}
                statusLabel="Duplicada DB"
                statusClassName={statusBadgeClass.skipped}
              />
            </TabsContent>

            <TabsContent value="errores">
              <PreviewErrorsTable preview={preview} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function MovimientosImportResultSummary({
  result,
}: {
  result: MovimientoImportResultDto;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <SummaryCard
        title="Creados"
        value={result.created}
        description="Movimientos insertados correctamente."
      />
      <SummaryCard
        title="Actualizados"
        value={result.updated}
        description="No aplica en este flujo unificado."
      />
      <SummaryCard
        title="Omitidos"
        value={result.skipped}
        description="Duplicados detectados al ejecutar."
      />
      <SummaryCard
        title="Errores"
        value={result.errors}
        description="Filas que fallaron durante la persistencia."
      />
    </div>
  );
}

function ResultDetailsTable({
  rows,
}: {
  rows: MovimientoImportResultDto["details"];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No hay detalles fila por fila para mostrar.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fila</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Titular</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Mensaje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((detail, index) => (
          <TableRow key={`${detail.rowNumber}-${detail.status}-${index}`}>
            <TableCell className="font-mono text-xs">
              {detail.rowNumber}
            </TableCell>
            <TableCell>
              <Badge
                className={
                  statusBadgeClass[detail.status] ?? statusBadgeClass.updated
                }
              >
                {detail.status}
              </Badge>
            </TableCell>
            <TableCell className="text-xs">{detail.row?.tipo ?? "—"}</TableCell>
            <TableCell className="text-xs tabular-nums">
              {detail.row ? currencyFormatter.format(detail.row.monto) : "—"}
            </TableCell>
            <TableCell className="text-xs">
              {detail.row?.titular ?? "—"}
            </TableCell>
            <TableCell className="max-w-[220px] whitespace-normal text-xs">
              {detail.row?.descripcionLiteral ?? "—"}
            </TableCell>
            <TableCell className="max-w-[280px] whitespace-normal text-xs">
              {detail.message ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MovimientosImportResultDetails({
  result,
}: {
  result: MovimientoImportResultDto;
}) {
  const createdRows = result.details.filter(
    (detail) => detail.status === "created",
  );
  const errorRows = result.details.filter(
    (detail) => detail.status === "error",
  );

  return (
    <div className="space-y-4">
      {result.skipped > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          {result.skipped} fila(s) fueron omitidas por duplicado al revalidar el
          archivo en el servidor.
        </div>
      ) : null}

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="created">
          <AccordionTrigger>Creados ({createdRows.length})</AccordionTrigger>
          <AccordionContent>
            <ResultDetailsTable rows={createdRows} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="errors">
          <AccordionTrigger>Errores ({errorRows.length})</AccordionTrigger>
          <AccordionContent>
            <ResultDetailsTable rows={errorRows} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function ImportMovimientosDialog({
  open,
  onOpenChange,
}: ImportMovimientosDialogProps) {
  const [executionError, setExecutionError] = useState<string | null>(null);
  const executeInFlightRef = useRef(false);
  const importState = useImportState<
    MovimientoImportPreviewDto,
    MovimientoImportResultDto
  >();
  const previewMutation = useImportMovimientosPreview();
  const executeMutation = useImportMovimientosExecute();

  const resetDialogState = () => {
    executeInFlightRef.current = false;
    setExecutionError(null);
    importState.reset();
    previewMutation.reset();
    executeMutation.reset();
  };

  const handleUpload = (file: File) => {
    executeInFlightRef.current = false;
    setExecutionError(null);
    previewMutation.reset();
    executeMutation.reset();
    importState.setFile(file);
  };

  const handleGoBack = () => {
    executeInFlightRef.current = false;
    setExecutionError(null);
    importState.reset();
    previewMutation.reset();
    executeMutation.reset();
  };

  const handleClearFile = () => {
    executeInFlightRef.current = false;
    setExecutionError(null);
    importState.setFile(null);
  };

  const handleProcessFile = async () => {
    if (!importState.state.file) return;

    setExecutionError(null);

    const preview = await previewMutation.mutateAsync(importState.state.file);
    importState.setPreview(preview);
  };

  const handleExecuteImport = async () => {
    const preview = importState.state.preview;
    if (!preview?.tempFileKey || executeInFlightRef.current || executeMutation.isPending) {
      return;
    }

    executeInFlightRef.current = true;

    setExecutionError(null);
    importState.startExecution();

    try {
      const result = await executeMutation.mutateAsync({
        tempFileKey: preview.tempFileKey,
      });
      importState.setResult(result);
    } catch (error) {
      setExecutionError(
        error instanceof Error
          ? error.message
          : "No se pudo completar la importación. Intentá nuevamente.",
      );
      importState.setPreview(preview);
    } finally {
      executeInFlightRef.current = false;
    }
  };

  const rowsReadyToImport = importState.state.preview?.nuevas.length ?? 0;

  return (
    <GenericImportDialog<MovimientoImportPreviewDto, MovimientoImportResultDto>
      open={open}
      onOpenChange={onOpenChange}
      title="Importar movimientos desde Excel"
      description="Importá movimientos bancarios usando la plantilla del estado de cuenta."
      state={importState.state}
      onUpload={handleUpload}
      onConfirm={handleExecuteImport}
      onReset={resetDialogState}
      onFileClear={handleClearFile}
      onProcessFile={handleProcessFile}
      onGoBack={handleGoBack}
      renderPreview={(preview) => (
        <div className="space-y-4">
          {executionError ? (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">La importación falló y no se guardó ningún movimiento.</p>
                <p className="text-xs text-destructive/90">{executionError}</p>
              </div>
            </div>
          ) : null}
          <MovimientosImportPreview preview={preview} />
        </div>
      )}
      renderResultSummary={(result) => (
        <MovimientosImportResultSummary result={result} />
      )}
      renderResultDetails={(result) => (
        <MovimientosImportResultDetails result={result} />
      )}
      canConfirm={rowsReadyToImport > 0}
      confirmLabel={`Importar ${rowsReadyToImport} movimiento(s)`}
      isProcessing={previewMutation.isPending}
      processingLabel="Procesando archivo..."
      executingMessage="Releyendo el archivo, validando filas y creando movimientos..."
      uploadFooter={
        <div className="space-y-3 border-t pt-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-3">
            <FileSpreadsheet className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium text-foreground">
                Qué valida esta importación
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                <li>
                  Columnas bancarias: Titular, Edo Cta, fechas, descripción,
                  Abono y Cargo.
                </li>
                <li>
                  Fechas con formato español estricto y regla XOR entre Abono /
                  Cargo.
                </li>
                <li>
                  Detección de filas INICIO, duplicados en el archivo y
                  duplicados en base de datos.
                </li>
              </ul>
            </div>
          </div>

          <Button variant="outline" className="w-full" disabled>
            <Download className="mr-2 size-4" />
            Plantilla bancaria (próximamente disponible)
          </Button>

          <p className="flex items-center gap-2 text-xs">
            <RefreshCcw className="size-3.5" />
            La ejecución vuelve a procesar el archivo en el servidor antes de
            guardar.
          </p>
        </div>
      }
    />
  );
}
