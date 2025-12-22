"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserPlus,
  RefreshCw,
  SkipForward,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { ScrollArea } from "@/core/shared/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/shared/ui/accordion";
import { ImportExecutionResultDto } from "../../server/dtos/ImportFacturaResultDto.dto";

interface ImportFacturasResultsProps {
  results: ImportExecutionResultDto;
  onClose: () => void;
  onNewImport: () => void;
}

export function ImportFacturasResults({
  results,
  onClose,
  onNewImport,
}: ImportFacturasResultsProps) {
  const { creadas, actualizadas, omitidas, errores, clientesCreados, ingresosCreados, egresosCreados, resultados } =
    results;

  const hasErrors = errores > 0;
  const isPartialSuccess = hasErrors && (creadas > 0 || actualizadas > 0);

  const createdResults = resultados.filter((r) => r.status === "created");
  const updatedResults = resultados.filter((r) => r.status === "updated");
  const skippedResults = resultados.filter((r) => r.status === "skipped");
  const errorResults = resultados.filter((r) => r.status === "error");

  return (
    <div className="space-y-6">
      {/* Header de estado */}
      <div
        className={`p-4 rounded-lg text-center ${
          hasErrors
            ? isPartialSuccess
              ? "bg-yellow-50 dark:bg-yellow-950/30"
              : "bg-red-50 dark:bg-red-950/30"
            : "bg-green-50 dark:bg-green-950/30"
        }`}
      >
        {hasErrors ? (
          isPartialSuccess ? (
            <>
              <AlertTriangle className="h-12 w-12 mx-auto text-yellow-600 mb-2" />
              <h3 className="text-lg font-semibold">
                Importacion completada con advertencias
              </h3>
              <p className="text-sm text-muted-foreground">
                Algunas facturas no pudieron ser importadas
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-600 mb-2" />
              <h3 className="text-lg font-semibold">Importacion fallida</h3>
              <p className="text-sm text-muted-foreground">
                No se pudieron importar las facturas
              </p>
            </>
          )
        ) : (
          <>
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-2" />
            <h3 className="text-lg font-semibold">Importacion exitosa</h3>
            <p className="text-sm text-muted-foreground">
              Todas las facturas fueron procesadas correctamente
            </p>
          </>
        )}
      </div>

      {/* Resumen de resultados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ResultCard
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          label="Creadas"
          value={creadas}
          variant="success"
        />
        <ResultCard
          icon={<RefreshCw className="h-5 w-5 text-blue-600" />}
          label="Actualizadas"
          value={actualizadas}
          variant="info"
        />
        <ResultCard
          icon={<SkipForward className="h-5 w-5 text-gray-600" />}
          label="Omitidas"
          value={omitidas}
          variant="neutral"
        />
        <ResultCard
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          label="Errores"
          value={errores}
          variant="error"
        />
      </div>

      {/* Entidades creadas automaticamente */}
      {(clientesCreados > 0 || ingresosCreados > 0 || egresosCreados > 0) && (
        <div className="grid grid-cols-3 gap-3">
          <ResultCard
            icon={<UserPlus className="h-5 w-5 text-purple-600" />}
            label="Clientes creados"
            value={clientesCreados}
            variant="purple"
          />
          <ResultCard
            icon={<ArrowDownCircle className="h-5 w-5 text-orange-600" />}
            label="Ingresos creados"
            value={ingresosCreados}
            variant="orange"
          />
          <ResultCard
            icon={<ArrowUpCircle className="h-5 w-5 text-pink-600" />}
            label="Egresos creados"
            value={egresosCreados}
            variant="pink"
          />
        </div>
      )}

      {/* Detalles por categoria */}
      <ScrollArea className="h-[300px] pr-4">
        <Accordion type="multiple" className="space-y-2">
          {createdResults.length > 0 && (
            <AccordionItem value="created" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Facturas creadas ({createdResults.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {createdResults.map((r) => (
                    <ResultRow key={r.rowNumber} result={r} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {updatedResults.length > 0 && (
            <AccordionItem value="updated" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  <span>Facturas actualizadas ({updatedResults.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {updatedResults.map((r) => (
                    <ResultRow key={r.rowNumber} result={r} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {skippedResults.length > 0 && (
            <AccordionItem value="skipped" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <SkipForward className="h-4 w-4 text-gray-600" />
                  <span>Facturas omitidas ({skippedResults.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {skippedResults.map((r) => (
                    <ResultRow key={r.rowNumber} result={r} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {errorResults.length > 0 && (
            <AccordionItem value="errors" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Errores ({errorResults.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {errorResults.map((r) => (
                    <ResultRow key={r.rowNumber} result={r} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </ScrollArea>

      {/* Acciones */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onNewImport} className="flex-1">
          Nueva importacion
        </Button>
        <Button onClick={onClose} className="flex-1">
          Cerrar
        </Button>
      </div>
    </div>
  );
}

function ResultCard({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: "success" | "info" | "neutral" | "error" | "purple" | "orange" | "pink";
}) {
  const bgColors = {
    success: "bg-green-50 dark:bg-green-950/30",
    info: "bg-blue-50 dark:bg-blue-950/30",
    neutral: "bg-gray-50 dark:bg-gray-950/30",
    error: "bg-red-50 dark:bg-red-950/30",
    purple: "bg-purple-50 dark:bg-purple-950/30",
    orange: "bg-orange-50 dark:bg-orange-950/30",
    pink: "bg-pink-50 dark:bg-pink-950/30",
  };

  return (
    <div className={`p-3 rounded-lg text-center ${bgColors[variant]}`}>
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="text-xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function ResultRow({
  result,
}: {
  result: {
    rowNumber: number;
    folioFiscal: string;
    status: string;
    message: string;
    facturaId?: string;
    clienteCreado?: { nombre: string; rfc: string };
    ingresoCreado?: { id: string; folioFiscal: string };
    egresoCreado?: { id: string; folioFiscal: string };
  };
}) {
  const statusConfig = {
    created: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700" },
    updated: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700" },
    skipped: { bg: "bg-gray-50 dark:bg-gray-950/30", text: "text-gray-700" },
    error: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700" },
  };

  const config = statusConfig[result.status as keyof typeof statusConfig];

  return (
    <div className={`p-3 rounded-lg text-sm ${config.bg}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium">{result.folioFiscal}</span>
        <Badge variant="secondary">Fila {result.rowNumber}</Badge>
      </div>
      <p className={`text-xs ${config.text}`}>{result.message}</p>
      {result.clienteCreado && (
        <p className="text-xs text-muted-foreground mt-1">
          Cliente creado: {result.clienteCreado.nombre} ({result.clienteCreado.rfc})
        </p>
      )}
      {result.ingresoCreado && (
        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
          Ingreso creado automaticamente
        </p>
      )}
      {result.egresoCreado && (
        <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
          Egreso creado automaticamente
        </p>
      )}
    </div>
  );
}
