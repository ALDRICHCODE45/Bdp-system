"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useGetTarifaHistorial } from "../hooks/useGetTarifaHistorial.hook";
import type { TarifaAbogadoAsuntoDto } from "../server/dtos/TarifaAbogadoAsuntoDto.dto";

interface TarifaHistorialSheetProps {
  tarifa: TarifaAbogadoAsuntoDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TarifaHistorialSheet({
  tarifa,
  isOpen,
  onClose,
}: TarifaHistorialSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const enabled = isOpen && !!tarifa;
  const { data, isLoading } = useGetTarifaHistorial(tarifa?.id ?? "", enabled);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Historial de Tarifa</SheetTitle>
          <SheetDescription>
            {tarifa
              ? `${tarifa.usuarioNombre} · ${tarifa.asuntoJuridicoNombre}`
              : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 py-4 space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin cambios registrados para esta tarifa.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.map((h) => (
                <li
                  key={h.id}
                  className="rounded-md border bg-card p-3 text-sm space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {formatDate(h.changedAt)}
                      </Badge>
                      <span>por {h.changedByNombre}</span>
                    </div>
                  </div>
                  <div className="font-mono text-sm">
                    {h.tarifaHoraAnterior ? (
                      <>
                        <span className="text-muted-foreground line-through">
                          {mxn.format(Number(h.tarifaHoraAnterior))}
                        </span>{" "}
                        →{" "}
                        <span className="font-semibold">
                          {mxn.format(Number(h.tarifaHoraNueva))}
                        </span>
                      </>
                    ) : (
                      <span>
                        Creación:{" "}
                        <span className="font-semibold">
                          {mxn.format(Number(h.tarifaHoraNueva))}
                        </span>
                      </span>
                    )}
                  </div>
                  {h.motivo && (
                    <p className="text-xs text-muted-foreground italic">
                      “{h.motivo}”
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
