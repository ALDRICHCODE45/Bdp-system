"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserPlus,
  Link2,
  Unlink,
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
import { RadioGroup, RadioGroupItem } from "@/core/shared/ui/radio-group";
import { Label } from "@/core/shared/ui/label";
import { ImportExcelPreviewDto, DuplicadaDto, SinVinculacionDto, AccionSinVinculacion } from "../../server/dtos/ImportExcelPreviewDto.dto";
import { ValidatedExcelRowDto } from "../../server/dtos/ImportFacturaExcelRowDto.dto";

interface ImportFacturasPreviewProps {
  preview: ImportExcelPreviewDto;
  duplicadasAActualizar: string[];
  actualizarTodasDuplicadas: boolean;
  accionesSinVinculacion: Record<number, AccionSinVinculacion>;
  onToggleDuplicada: (id: string) => void;
  onToggleActualizarTodas: () => void;
  onSetAccionSinVinculacion: (rowNumber: number, accion: AccionSinVinculacion) => void;
}

export function ImportFacturasPreview({
  preview,
  duplicadasAActualizar,
  actualizarTodasDuplicadas,
  accionesSinVinculacion,
  onToggleDuplicada,
  onToggleActualizarTodas,
  onSetAccionSinVinculacion,
}: ImportFacturasPreviewProps) {
  const { resumen, nuevas, duplicadas, sinVinculacion, clientesNuevos, errores } = preview;

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
        />
        <SummaryCard
          icon={<Unlink className="h-5 w-5 text-orange-600" />}
          label="Sin vinculacion"
          value={resumen.totalSinVinculacion}
          variant="orange"
        />
        <SummaryCard
          icon={<UserPlus className="h-5 w-5 text-blue-600" />}
          label="Clientes nuevos"
          value={resumen.totalClientesNuevos}
          variant="info"
        />
        <SummaryCard
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          label="Errores"
          value={resumen.totalErrores}
          variant="error"
        />
      </div>

      {/* Info de vinculacion */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <Link2 className="h-4 w-4" />
        <span>
          {resumen.totalConVinculacion} facturas con vinculacion I/E encontrada,{" "}
          {resumen.totalSinVinculacion} sin vinculacion (elige que hacer con cada una)
        </span>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <Accordion type="multiple" className="space-y-2">
          {/* Facturas nuevas */}
          {nuevas.length > 0 && (
            <AccordionItem value="nuevas" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Facturas nuevas ({nuevas.length})</span>
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
                  <span>Facturas duplicadas ({duplicadas.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {/* Toggle todas */}
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id="actualizar-todas"
                      checked={actualizarTodasDuplicadas}
                      onCheckedChange={onToggleActualizarTodas}
                    />
                    <label
                      htmlFor="actualizar-todas"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Actualizar todas las duplicadas
                    </label>
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
                      disabled={actualizarTodasDuplicadas}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Facturas sin vinculacion */}
          {sinVinculacion.length > 0 && (
            <AccordionItem value="sinVinculacion" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Unlink className="h-4 w-4 text-orange-600" />
                  <span>Facturas sin vinculacion ({sinVinculacion.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Estas facturas no tienen un Ingreso/Egreso con el mismo folio fiscal.
                  Selecciona que hacer con cada una:
                </p>
                <div className="space-y-3 pt-2">
                  {sinVinculacion.map((item) => (
                    <SinVinculacionRow
                      key={item.row.rowNumber}
                      item={item}
                      accionSeleccionada={accionesSinVinculacion[item.row.rowNumber]}
                      onAccionChange={(accion) => onSetAccionSinVinculacion(item.row.rowNumber, accion)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Clientes nuevos */}
          {clientesNuevos.length > 0 && (
            <AccordionItem value="clientes" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <span>Clientes nuevos a crear ({clientesNuevos.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Estos clientes se crearan automaticamente durante la
                  importacion.
                </p>
                <div className="space-y-2 pt-2">
                  {clientesNuevos.map((cliente) => (
                    <div
                      key={cliente.rfc}
                      className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm"
                    >
                      <div>
                        <p className="font-medium">{cliente.nombre}</p>
                        <p className="text-muted-foreground">
                          RFC: {cliente.rfc}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {cliente.rowNumbers.length} factura(s)
                      </Badge>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Errores */}
          {errores.length > 0 && (
            <AccordionItem value="errores" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Errores de validacion ({errores.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {errores.map((error) => (
                    <div
                      key={error.rowNumber}
                      className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-sm"
                    >
                      <p className="font-medium text-red-700 dark:text-red-400">
                        Fila {error.rowNumber}
                      </p>
                      <ul className="mt-1 list-disc list-inside text-red-600 dark:text-red-400">
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

function SummaryCard({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: "success" | "warning" | "info" | "error" | "orange";
}) {
  const bgColors = {
    success: "bg-green-50 dark:bg-green-950/30",
    warning: "bg-yellow-50 dark:bg-yellow-950/30",
    info: "bg-blue-50 dark:bg-blue-950/30",
    error: "bg-red-50 dark:bg-red-950/30",
    orange: "bg-orange-50 dark:bg-orange-950/30",
  };

  return (
    <div className={`p-3 rounded-lg ${bgColors[variant]}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function NuevaFacturaRow({ row }: { row: ValidatedExcelRowDto }) {
  return (
    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.folioFiscal}</span>
          {row.vinculacion?.encontrado ? (
            <Badge variant="outline" className="text-xs">
              <Link2 className="h-3 w-3 mr-1" />
              {row.vinculacion.tipoOrigen}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Sin vinculacion
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {row.clienteProveedor} - ${row.monto?.toLocaleString()}
        </p>
      </div>
      <Badge variant="secondary">Fila {row.rowNumber}</Badge>
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
  return (
    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg text-sm">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          disabled={disabled}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{duplicada.row.folioFiscal}</span>
            <Badge variant="secondary">Fila {duplicada.row.rowNumber}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">En Excel:</p>
              <p>{duplicada.row.clienteProveedor}</p>
              <p>${duplicada.row.monto?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">En sistema:</p>
              <p>{duplicada.existing.clienteProveedor}</p>
              <p>${duplicada.existing.monto?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SinVinculacionRow({
  item,
  accionSeleccionada,
  onAccionChange,
}: {
  item: SinVinculacionDto;
  accionSeleccionada: AccionSinVinculacion;
  onAccionChange: (accion: AccionSinVinculacion) => void;
}) {
  return (
    <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{item.row.folioFiscal}</span>
        <Badge variant="secondary">Fila {item.row.rowNumber}</Badge>
      </div>
      <p className="text-muted-foreground mb-3">
        {item.row.clienteProveedor} - ${item.row.monto?.toLocaleString()}
      </p>
      <RadioGroup
        value={accionSeleccionada || ""}
        onValueChange={(value) => onAccionChange(value as AccionSinVinculacion)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="crear_ingreso" id={`ingreso-${item.row.rowNumber}`} />
          <Label htmlFor={`ingreso-${item.row.rowNumber}`} className="cursor-pointer">
            Crear Ingreso automaticamente
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="crear_egreso" id={`egreso-${item.row.rowNumber}`} />
          <Label htmlFor={`egreso-${item.row.rowNumber}`} className="cursor-pointer">
            Crear Egreso automaticamente
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sin_vincular" id={`sin-${item.row.rowNumber}`} />
          <Label htmlFor={`sin-${item.row.rowNumber}`} className="cursor-pointer">
            Solo factura (sin vincular a I/E)
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
