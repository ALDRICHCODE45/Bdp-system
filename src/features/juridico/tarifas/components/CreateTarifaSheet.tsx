"use client";
import { useState, useEffect } from "react";
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
import { Combobox } from "@/core/shared/ui/combobox";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useCreateTarifa } from "../hooks/useCreateTarifa.hook";
import { getActiveUsersForReporteAction } from "@/features/juridico/horas/server/actions/getActiveUsersForReporteAction";
import { getAsuntosJuridicosAction } from "@/features/juridico/asuntos/server/actions/getAsuntosJuridicosAction";
import { ZodError } from "zod";
import { z } from "zod";

interface CreateTarifaSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormState = {
  usuarioId: string;
  asuntoJuridicoId: string;
  tarifaHora: string;
  motivo: string;
};

const emptyForm: FormState = {
  usuarioId: "",
  asuntoJuridicoId: "",
  tarifaHora: "",
  motivo: "",
};

// Client-side validator (same shape as server, but accepts string for tarifaHora)
const createTarifaSchemaUI = z.object({
  usuarioId: z.string().min(1, "Selecciona un abogado"),
  asuntoJuridicoId: z.string().min(1, "Selecciona un asunto"),
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

export function CreateTarifaSheet({ isOpen, onClose }: CreateTarifaSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [abogados, setAbogados] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [asuntos, setAsuntos] = useState<{ id: string; nombre: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const createMutation = useCreateTarifa();

  useEffect(() => {
    if (!isOpen) return;
    setLoadingOptions(true);
    Promise.all([
      getActiveUsersForReporteAction(),
      getAsuntosJuridicosAction(),
    ]).then(([usersRes, asuntosRes]) => {
      if (usersRes.ok) {
        setAbogados(
          usersRes.data.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
          })),
        );
      }
      if (asuntosRes.ok) {
        setAsuntos(
          asuntosRes.data.map((a) => ({ id: a.id, nombre: a.nombre })),
        );
      }
      setLoadingOptions(false);
    });
  }, [isOpen]);

  const handleSelectChange = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      usuarioId: form.usuarioId,
      asuntoJuridicoId: form.asuntoJuridicoId,
      tarifaHora: Number(form.tarifaHora),
      motivo: form.motivo || null,
    };

    try {
      createTarifaSchemaUI.parse({
        ...payload,
        tarifaHora: form.tarifaHora, // validate as string at UI level
      });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof FormState, string>> = {};
        for (const issue of err.issues) {
          const field = issue.path[0] as keyof FormState;
          if (field) fieldErrors[field] = issue.message;
        }
        setErrors(fieldErrors);
        return;
      }
    }

    await createMutation.mutateAsync(payload);
    setForm(emptyForm);
    onClose();
  };

  const previewImporte =
    form.tarifaHora &&
    !isNaN(Number(form.tarifaHora)) &&
    Number(form.tarifaHora) > 0
      ? mxn.format(Number(form.tarifaHora))
      : "—";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nueva Tarifa por Hora</SheetTitle>
          <SheetDescription>
            Define el valor por hora (MXN) que se le paga a un abogado para un
            asunto específico.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="usuarioId">
              Abogado <span className="text-red-500">*</span>
            </Label>
            <Combobox
              options={abogados.map((u) => ({ value: u.id, label: u.name }))}
              value={form.usuarioId}
              onChange={handleSelectChange("usuarioId")}
              placeholder="Selecciona un abogado"
              searchPlaceholder="Buscar..."
              disabled={loadingOptions}
            />
            {errors.usuarioId && (
              <p className="text-xs text-red-500">{errors.usuarioId}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="asuntoJuridicoId">
              Asunto jurídico <span className="text-red-500">*</span>
            </Label>
            <Combobox
              options={asuntos.map((a) => ({ value: a.id, label: a.nombre }))}
              value={form.asuntoJuridicoId}
              onChange={handleSelectChange("asuntoJuridicoId")}
              placeholder="Selecciona un asunto"
              searchPlaceholder="Buscar..."
              disabled={loadingOptions}
            />
            {errors.asuntoJuridicoId && (
              <p className="text-xs text-red-500">{errors.asuntoJuridicoId}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="tarifaHora">
              Tarifa por hora (MXN) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tarifaHora"
              type="number"
              step="0.01"
              min="0.01"
              value={form.tarifaHora}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, tarifaHora: e.target.value }));
                if (errors.tarifaHora) {
                  setErrors((prev) => ({ ...prev, tarifaHora: undefined }));
                }
              }}
              placeholder="0.00"
            />
            {errors.tarifaHora && (
              <p className="text-xs text-red-500">{errors.tarifaHora}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Vista previa: <span className="font-mono">{previewImporte}</span>{" "}
              por hora
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="motivo">Motivo (opcional)</Label>
            <textarea
              id="motivo"
              value={form.motivo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, motivo: e.target.value }))
              }
              placeholder="Ej. Ajuste de tarifa inicial"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || loadingOptions}
          >
            {createMutation.isPending ? "Guardando..." : "Crear Tarifa"}
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
