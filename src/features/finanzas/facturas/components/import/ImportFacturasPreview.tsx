"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ShieldAlert,
  Minus,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/core/shared/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/shared/ui/accordion";
import { Checkbox } from "@/core/shared/ui/checkbox";
import { ScrollArea } from "@/core/shared/ui/scroll-area";
import { cn } from "@/core/lib/utils";
import type {
  ImportExcelPreviewDto,
  DuplicadaDto,
  FieldChange,
} from "../../server/dtos/ImportExcelPreviewDto.dto";
import type { ValidatedExcelRowDto } from "../../server/dtos/ImportFacturaExcelRowDto.dto";

// ── Helpers de formato ─────────────────────────────────────────────────────────

function formatValue(value: string | number | null): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return String(value);
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface ImportFacturasPreviewProps {
  preview: ImportExcelPreviewDto;
  duplicadasAActualizar: string[];
  actualizarTodasDuplicadas: boolean;
  onToggleDuplicada: (id: string) => void;
  onToggleActualizarTodas: () => void;
}

// ── Componente principal ───────────────────────────────────────────────────────

export function ImportFacturasPreview({
  preview,
  duplicadasAActualizar,
  actualizarTodasDuplicadas,
  onToggleDuplicada,
  onToggleActualizarTodas,
}: ImportFacturasPreviewProps) {
  const { resumen, nuevas, duplicadas, errores } = preview;

  const duplicadasConCambios = duplicadas.filter((d) => d.changedFields.length > 0);
  const duplicadasSinCambios = duplicadas.filter((d) => d.changedFields.length === 0);
  const totalHighRisk = duplicadas.filter((d) => d.hasHighRiskChanges).length;

  return (
    <div className="space-y-4">
      {/* Aviso de header detectado fuera de la fila 1 */}
      {preview.headerExcelRow && preview.headerExcelRow > 1 && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            Encabezado detectado automáticamente en la fila {preview.headerExcelRow}.
            Los datos se leyeron a partir de la fila {preview.headerExcelRow + 1}.
          </span>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          label="Nuevas"
          value={resumen.totalNuevas}
          variant="success"
        />
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
          label="Duplicadas"
          value={resumen.totalDuplicadas}
          variant="warning"
          sublabel={
            duplicadasSinCambios.length > 0
              ? `${duplicadasSinCambios.length} sin cambios`
              : undefined
          }
        />
        <SummaryCard
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          label="Con errores"
          value={resumen.totalErrores}
          variant="error"
        />
      </div>

      {/* Alerta de alto riesgo */}
      {totalHighRisk > 0 && (
        <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg text-sm text-orange-700 dark:text-orange-300">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">
              {totalHighRisk} {totalHighRisk === 1 ? "factura duplicada tiene" : "facturas duplicadas tienen"} cambios en campos financieros o fiscales
            </span>
            {" "}(total, subtotal, impuestos, RFC, moneda). Revisá con cuidado antes de confirmar.
          </div>
        </div>
      )}

      <ScrollArea className="h-[400px] pr-4">
        <Accordion type="multiple" defaultValue={["nuevas", "duplicadas", "errores"]} className="space-y-2">

          {/* Facturas nuevas */}
          {nuevas.length > 0 && (
            <AccordionItem value="nuevas" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Facturas nuevas</span>
                  <Badge variant="secondary">{nuevas.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {nuevas.map((row) => (
                    <NuevaFacturaRow key={row.rowNumber} row={row} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Facturas duplicadas */}
          {duplicadas.length > 0 && (
            <AccordionItem value="duplicadas" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Facturas duplicadas</span>
                  <Badge variant="secondary">{duplicadas.length}</Badge>
                  {totalHighRisk > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      {totalHighRisk} riesgo alto
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {/* Control global */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="actualizar-todas"
                        checked={actualizarTodasDuplicadas}
                        onCheckedChange={onToggleActualizarTodas}
                      />
                      <label htmlFor="actualizar-todas" className="text-sm font-medium cursor-pointer">
                        Actualizar todas las que tienen cambios ({duplicadasConCambios.length})
                      </label>
                    </div>
                    {duplicadasSinCambios.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {duplicadasSinCambios.length} idéntica{duplicadasSinCambios.length !== 1 ? "s" : ""} al sistema (se omitirán)
                      </span>
                    )}
                  </div>

                  {duplicadas.map((dup) => (
                    <DuplicadaFacturaRow
                      key={dup.existing.id}
                      duplicada={dup}
                      isSelected={
                        actualizarTodasDuplicadas ||
                        duplicadasAActualizar.includes(dup.existing.id)
                      }
                      onToggle={() => onToggleDuplicada(dup.existing.id)}
                      disabled={actualizarTodasDuplicadas || dup.changedFields.length === 0}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Errores de validación */}
          {errores.length > 0 && (
            <AccordionItem value="errores" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Errores de validación</span>
                  <Badge variant="destructive">{errores.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {errores.map((error) => (
                    <div
                      key={error.rowNumber}
                      className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-sm"
                    >
                      <p className="font-medium text-red-700 dark:text-red-400 mb-1">
                        Fila {error.rowNumber}
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-red-600 dark:text-red-400">
                        {error.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </ScrollArea>
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function SummaryCard({
  icon,
  label,
  value,
  variant,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: "success" | "warning" | "error";
  sublabel?: string;
}) {
  const bgColors = {
    success: "bg-green-50 dark:bg-green-950/30",
    warning: "bg-yellow-50 dark:bg-yellow-950/30",
    error: "bg-red-50 dark:bg-red-950/30",
  };

  return (
    <div className={`p-3 rounded-lg ${bgColors[variant]}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sublabel && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}

function NuevaFacturaRow({ row }: { row: ValidatedExcelRowDto }) {
  return (
    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm">
      <div className="space-y-0.5 min-w-0">
        <p className="font-mono text-xs text-muted-foreground truncate">{row.uuid}</p>
        <p className="font-medium truncate">{row.concepto}</p>
        <p className="text-xs text-muted-foreground">
          {row.rfcReceptor}{row.nombreReceptor ? ` — ${row.nombreReceptor}` : ""} ·{" "}
          <span className="font-semibold text-foreground">
            ${row.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </span>
        </p>
      </div>
      <Badge variant="secondary" className="flex-shrink-0 ml-2">Fila {row.rowNumber}</Badge>
    </div>
  );
}

function DuplicadaFacturaRow({
  duplicada,
  isSelected,
  onToggle,
  disabled,
}: {
  duplicada: DuplicadaDto;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  const { row, existing, changedFields, hasHighRiskChanges } = duplicada;
  const hasChanges = changedFields.length > 0;
  const highRiskCount = changedFields.filter((c) => c.isHighRisk).length;

  return (
    <div
      className={cn(
        "rounded-lg border text-sm overflow-hidden",
        hasChanges
          ? hasHighRiskChanges
            ? "border-orange-200 dark:border-orange-800"
            : "border-yellow-200 dark:border-yellow-800"
          : "border-border opacity-60"
      )}
    >
      {/* Header de la card */}
      <div
        className={cn(
          "flex items-start gap-3 p-3",
          hasChanges
            ? hasHighRiskChanges
              ? "bg-orange-50 dark:bg-orange-950/20"
              : "bg-yellow-50 dark:bg-yellow-950/20"
            : "bg-muted/30"
        )}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          disabled={disabled}
          className="mt-0.5 flex-shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[280px]">
              {row.uuid}
            </span>
            <Badge variant="outline" className="text-xs flex-shrink-0">Fila {row.rowNumber}</Badge>
          </div>
          <p className="font-medium truncate">{row.concepto}</p>
          <p className="text-xs text-muted-foreground">
            {row.rfcReceptor}{row.nombreReceptor ? ` — ${row.nombreReceptor}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {!hasChanges ? (
            <Badge variant="secondary" className="text-xs gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              Sin cambios — se omitirá
            </Badge>
          ) : (
            <>
              <Badge
                variant={hasHighRiskChanges ? "destructive" : "secondary"}
                className="text-xs"
              >
                {changedFields.length} campo{changedFields.length !== 1 ? "s" : ""} cambiado{changedFields.length !== 1 ? "s" : ""}
              </Badge>
              {highRiskCount > 0 && (
                <Badge variant="outline" className="text-xs gap-1 text-orange-600 border-orange-300">
                  <ShieldAlert className="h-3 w-3" />
                  {highRiskCount} de riesgo alto
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabla de cambios */}
      {hasChanges && (
        <div className="border-t">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground w-1/4">Campo</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[37.5%]">En sistema (actual)</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[37.5%]">En Excel (nuevo)</th>
              </tr>
            </thead>
            <tbody>
              {changedFields.map((change, i) => (
                <FieldChangeRow key={change.field} change={change} isLast={i === changedFields.length - 1} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FieldChangeRow({
  change,
  isLast,
}: {
  change: FieldChange;
  isLast: boolean;
}) {
  return (
    <tr
      className={cn(
        "transition-colors",
        !isLast && "border-b border-border/50",
        change.isHighRisk
          ? "bg-orange-50/50 dark:bg-orange-950/10"
          : "hover:bg-muted/20"
      )}
    >
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          {change.isHighRisk && (
            <ShieldAlert className="h-3 w-3 text-orange-500 flex-shrink-0" />
          )}
          <span className={cn("font-medium", change.isHighRisk && "text-orange-700 dark:text-orange-400")}>
            {change.label}
          </span>
        </div>
      </td>
      <td className="px-3 py-2">
        <span className="text-muted-foreground line-through decoration-muted-foreground/50">
          {formatValue(change.oldValue)}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span
            className={cn(
              "font-medium",
              change.isHighRisk
                ? "text-orange-700 dark:text-orange-300"
                : "text-foreground"
            )}
          >
            {change.newValue === null ? (
              <span className="flex items-center gap-1 text-muted-foreground italic">
                <Minus className="h-3 w-3" /> vacío
              </span>
            ) : (
              formatValue(change.newValue)
            )}
          </span>
        </div>
      </td>
    </tr>
  );
}
