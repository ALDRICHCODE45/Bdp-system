"use client";
import { useState } from "react";
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
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useUpdateTarifa } from "../hooks/useUpdateTarifa.hook";
import { ZodError } from "zod";
import { z } from "zod";
import type { TarifaAbogadoAsuntoDto } from "../server/dtos/TarifaAbogadoAsuntoDto.dto";

interface EditTarifaSheetProps {
  tarifa: TarifaAbogadoAsuntoDto;
  isOpen: boolean;
  onClose: () => void;
}

const updateTarifaSchemaUI = z.object({
  tarifaHora: z
    .string()
    .min(1, "La tarifa es requerida")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "La tarifa por hora debe ser mayor a 0",
    }),
  motivo: z.string().optional().nullable(),
});

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function EditTarifaSheet({
  tarifa,
  isOpen,
  onClose,
}: EditTarifaSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const [tarifaHora, setTarifaHora] = useState<string>(tarifa.tarifaHora);
  const [motivo, setMotivo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useUpdateTarifa();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      updateTarifaSchemaUI.parse({ tarifaHora, motivo: motivo || null });
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues;
        setError(issues[0]?.message ?? "Datos inválidos");
        return;
      }
    }

    await updateMutation.mutateAsync({
      id: tarifa.id,
      tarifaHora: Number(tarifaHora),
      motivo: motivo || null,
    });
    onClose();
  };

  const previewImporte =
    tarifaHora && !isNaN(Number(tarifaHora)) && Number(tarifaHora) > 0
      ? mxn.format(Number(tarifaHora))
      : "—";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Tarifa</SheetTitle>
          <SheetDescription>
            {tarifa.usuarioNombre} · {tarifa.asuntoJuridicoNombre}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="tarifaHora">
              Tarifa por hora (MXN) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tarifaHora"
              type="number"
              step="0.01"
              min="0.01"
              value={tarifaHora}
              onChange={(e) => {
                setTarifaHora(e.target.value);
                setError(null);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Valor actual:{" "}
              <span className="font-mono">
                {mxn.format(Number(tarifa.tarifaHora))}
              </span>
              {" · "}
              Vista previa: <span className="font-mono">{previewImporte}</span>
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="motivo">Motivo del cambio</Label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Incremento anual 2026"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar cambio"}
          </Button>
        </form>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
