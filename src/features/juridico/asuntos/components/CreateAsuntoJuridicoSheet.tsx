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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useCreateAsuntoJuridico } from "../hooks/useCreateAsuntoJuridico.hook";
import { createAsuntoJuridicoSchemaUI } from "../schemas/createAsuntoJuridicoSchema";
import { ZodError } from "zod";
import { getClientesJuridicosAction } from "@/features/juridico/clientes/server/actions/getClientesJuridicosAction";
import { getAllSociosAction } from "@/features/RecursosHumanos/socios/server/actions/getAllSociosAction";
import type { ClienteJuridicoDto } from "@/features/juridico/clientes/server/dtos/ClienteJuridicoDto.dto";
import type { SocioDto } from "@/features/RecursosHumanos/socios/server/dtos/SocioDto.dto";

interface CreateAsuntoJuridicoSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormState = {
  nombre: string;
  descripcion: string;
  clienteJuridicoId: string;
  socioId: string;
};

const emptyForm: FormState = {
  nombre: "",
  descripcion: "",
  clienteJuridicoId: "",
  socioId: "",
};

export function CreateAsuntoJuridicoSheet({
  isOpen,
  onClose,
}: CreateAsuntoJuridicoSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [clientes, setClientes] = useState<ClienteJuridicoDto[]>([]);
  const [socios, setSocios] = useState<SocioDto[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const createMutation = useCreateAsuntoJuridico();

  // Load clientes and socios when sheet opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingOptions(true);
    Promise.all([getClientesJuridicosAction(), getAllSociosAction()]).then(
      ([clientesResult, sociosResult]) => {
        if (clientesResult.ok) setClientes(clientesResult.data);
        if (sociosResult.ok && sociosResult.data) setSocios(sociosResult.data);
        setLoadingOptions(false);
      }
    );
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

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
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      clienteJuridicoId: form.clienteJuridicoId,
      socioId: form.socioId,
    };

    try {
      createAsuntoJuridicoSchemaUI.parse(payload);
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
          <SheetTitle>Nuevo Asunto Jurídico</SheetTitle>
          <SheetDescription>
            Ingresa la información del asunto jurídico.
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
              placeholder="Nombre del asunto jurídico"
            />
            {errors.nombre && (
              <p className="text-xs text-red-500">{errors.nombre}</p>
            )}
          </div>

          {/* Cliente Jurídico */}
          <div className="space-y-1">
            <Label htmlFor="clienteJuridicoId">
              Cliente Jurídico <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.clienteJuridicoId}
              onValueChange={handleSelectChange("clienteJuridicoId")}
              disabled={loadingOptions}
            >
              <SelectTrigger id="clienteJuridicoId" className="w-full">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clienteJuridicoId && (
              <p className="text-xs text-red-500">{errors.clienteJuridicoId}</p>
            )}
          </div>

          {/* Socio */}
          <div className="space-y-1">
            <Label htmlFor="socioId">
              Socio <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.socioId}
              onValueChange={handleSelectChange("socioId")}
              disabled={loadingOptions}
            >
              <SelectTrigger id="socioId" className="w-full">
                <SelectValue placeholder="Selecciona un socio" />
              </SelectTrigger>
              <SelectContent>
                {socios.map((socio) => (
                  <SelectItem key={socio.id} value={socio.id}>
                    {socio.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.socioId && (
              <p className="text-xs text-red-500">{errors.socioId}</p>
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
              placeholder="Descripción detallada del asunto (opcional)"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || loadingOptions}
          >
            {createMutation.isPending ? "Guardando..." : "Crear Asunto"}
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
