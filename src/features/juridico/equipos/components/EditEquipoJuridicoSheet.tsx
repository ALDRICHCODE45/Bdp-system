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
import { Separator } from "@/core/shared/ui/separator";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useUpdateEquipoJuridico } from "../hooks/useUpdateEquipoJuridico.hook";
import { updateEquipoJuridicoSchemaUI } from "../schemas/updateEquipoJuridicoSchema";
import type { EquipoJuridicoDto } from "../server/dtos/EquipoJuridicoDto.dto";
import { ZodError } from "zod";
import { EquipoMiembrosManager } from "./EquipoMiembrosManager";
import { useGetEquiposJuridicos } from "../hooks/useGetEquiposJuridicos.hook";

interface EditEquipoJuridicoSheetProps {
  equipo: EquipoJuridicoDto;
  isOpen: boolean;
  onClose: () => void;
}

type FormState = {
  nombre: string;
  descripcion: string;
};

export function EditEquipoJuridicoSheet({
  equipo,
  isOpen,
  onClose,
}: EditEquipoJuridicoSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  const [form, setForm] = useState<FormState>({
    nombre: equipo.nombre,
    descripcion: equipo.descripcion ?? "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  // Sync form when equipo prop changes
  useEffect(() => {
    setForm({
      nombre: equipo.nombre,
      descripcion: equipo.descripcion ?? "",
    });
    setErrors({});
  }, [equipo]);

  const updateMutation = useUpdateEquipoJuridico();

  // Get live equipo data so EquipoMiembrosManager reflects real-time member changes
  const { data: equipos } = useGetEquiposJuridicos();
  const liveEquipo = equipos?.find((e) => e.id === equipo.id) ?? equipo;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      id: equipo.id,
      nombre: form.nombre,
      descripcion: form.descripcion || null,
    };

    try {
      updateEquipoJuridicoSchemaUI.parse(payload);
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

    await updateMutation.mutateAsync(payload);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Equipo Jurídico</SheetTitle>
          <SheetDescription>
            Modifica la información del equipo y gestiona sus miembros.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-1 py-4">
          {/* Nombre */}
          <div className="space-y-1">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre del equipo jurídico"
            />
            {errors.nombre && (
              <p className="text-xs text-red-500">{errors.nombre}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <Label htmlFor="descripcion">Descripción</Label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción del equipo (opcional)"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>

        <Separator className="my-4" />

        {/* Miembros manager */}
        <div className="px-1 pb-4">
          <EquipoMiembrosManager equipo={liveEquipo} />
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
