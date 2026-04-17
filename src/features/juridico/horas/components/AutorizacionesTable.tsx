"use client";
import { useState } from "react";
import { useGetAutorizacionesPendientes } from "../hooks/useGetAutorizacionesPendientes.hook";
import { useAutorizarEdicion } from "../hooks/useAutorizarEdicion.hook";
import { useRechazarEdicion } from "../hooks/useRechazarEdicion.hook";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { Textarea } from "@/core/shared/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/shared/ui/table";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import type { AutorizacionEdicionDto } from "../server/dtos/AutorizacionEdicionDto.dto";

function RechazarInline({
  autorizacion,
  onDone,
}: {
  autorizacion: AutorizacionEdicionDto;
  onDone: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const rechazarMutation = useRechazarEdicion();

  const handleRechazar = async () => {
    if (motivo.trim().length < 5) return;
    await rechazarMutation.mutateAsync({
      autorizacionId: autorizacion.id,
      motivoRechazo: motivo,
    });
    onDone();
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <Textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Motivo del rechazo (mín 5 caracteres)..."
        rows={2}
        maxLength={500}
        className="text-xs"
        disabled={rechazarMutation.isPending}
      />
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="destructive"
          onClick={handleRechazar}
          disabled={rechazarMutation.isPending || motivo.trim().length < 5}
        >
          {rechazarMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Confirmar rechazo"
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export function AutorizacionesTable() {
  const { data: autorizaciones, isPending, isFetching } = useGetAutorizacionesPendientes();
  const autorizarMutation = useAutorizarEdicion();
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando solicitudes...
      </div>
    );
  }

  if (!autorizaciones || autorizaciones.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Clock className="h-4 w-4" />
        No hay solicitudes de edición pendientes.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold">Solicitudes de Edición Pendientes</h2>
        <Badge variant="secondary" className="text-xs">
          {autorizaciones.length}
        </Badge>
        {isFetching && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Solicitante</TableHead>
              <TableHead>Semana</TableHead>
              <TableHead>Justificación</TableHead>
              <TableHead>Solicitado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {autorizaciones.map((autorizacion) => (
              <TableRow key={autorizacion.id}>
                <TableCell>
                  <div>
                    <div className="text-sm font-medium">
                      {autorizacion.solicitanteNombre}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {autorizacion.solicitanteEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">
                    Sem {autorizacion.semana} - {autorizacion.ano}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[250px]">
                    <p className="text-sm">{autorizacion.justificacion}</p>
                    {rechazandoId === autorizacion.id && (
                      <RechazarInline
                        autorizacion={autorizacion}
                        onDone={() => setRechazandoId(null)}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(autorizacion.createdAt).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {rechazandoId !== autorizacion.id && (
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-300 hover:bg-green-50"
                        onClick={() =>
                          autorizarMutation.mutate(autorizacion.id)
                        }
                        disabled={autorizarMutation.isPending}
                        title="Autorizar"
                      >
                        {autorizarMutation.isPending &&
                        autorizarMutation.variables === autorizacion.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span className="ml-1 hidden sm:inline">Autorizar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 border-red-300 hover:bg-red-50"
                        onClick={() => setRechazandoId(autorizacion.id)}
                        title="Rechazar"
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Rechazar</span>
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
