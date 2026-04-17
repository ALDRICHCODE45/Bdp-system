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
import { useCreateClienteJuridico } from "../hooks/useCreateClienteJuridico.hook";
import { createClienteJuridicoSchemaUI } from "../schemas/createClienteJuridicoSchema";
import { ZodError } from "zod";

interface CreateClienteJuridicoSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormState = {
  nombre: string;
  rfc: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  notas: string;
};

const emptyForm: FormState = {
  nombre: "",
  rfc: "",
  contacto: "",
  email: "",
  telefono: "",
  direccion: "",
  notas: "",
};

export function CreateClienteJuridicoSheet({
  isOpen,
  onClose,
}: CreateClienteJuridicoSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );

  const createMutation = useCreateClienteJuridico();

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
      nombre: form.nombre,
      rfc: form.rfc || null,
      contacto: form.contacto || null,
      email: form.email || null,
      telefono: form.telefono || null,
      direccion: form.direccion || null,
      notas: form.notas || null,
    };

    try {
      createClienteJuridicoSchemaUI.parse(payload);
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuevo Cliente Jurídico</SheetTitle>
          <SheetDescription>
            Ingresa la información del cliente jurídico.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
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
              placeholder="Razón social o nombre del cliente"
            />
            {errors.nombre && (
              <p className="text-xs text-red-500">{errors.nombre}</p>
            )}
          </div>

          {/* RFC */}
          <div className="space-y-1">
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              name="rfc"
              value={form.rfc}
              onChange={handleChange}
              placeholder="RFC del cliente (opcional)"
            />
          </div>

          {/* Contacto */}
          <div className="space-y-1">
            <Label htmlFor="contacto">Contacto</Label>
            <Input
              id="contacto"
              name="contacto"
              value={form.contacto}
              onChange={handleChange}
              placeholder="Nombre del contacto principal"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-1">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Número de teléfono"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-1">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Dirección del cliente"
            />
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label htmlFor="notas">Notas</Label>
            <textarea
              id="notas"
              name="notas"
              value={form.notas}
              onChange={handleChange}
              placeholder="Notas adicionales (opcional)"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Guardando..." : "Crear Cliente"}
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
