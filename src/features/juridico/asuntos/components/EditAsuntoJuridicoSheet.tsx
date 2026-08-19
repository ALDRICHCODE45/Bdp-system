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
import { Combobox } from "@/core/shared/ui/combobox";
import { useUpdateAsuntoJuridico } from "../hooks/useUpdateAsuntoJuridico.hook";
import { updateAsuntoJuridicoSchemaUI } from "../schemas/updateAsuntoJuridicoSchema";
import type { AsuntoJuridicoDto } from "../server/dtos/AsuntoJuridicoDto.dto";
import { ZodError } from "zod";
import { useGetJuridicoClientes } from "@/features/juridico/clientes-directorio/hooks/useGetJuridicoClientes.hook";
import { getAllSociosAction } from "@/features/RecursosHumanos/socios/server/actions/getAllSociosAction";
import type { SocioDto } from "@/features/RecursosHumanos/socios/server/dtos/SocioDto.dto";

interface EditAsuntoJuridicoSheetProps {
  asunto: AsuntoJuridicoDto;
  isOpen: boolean;
  onClose: () => void;
}

type FormState = {
  nombre: string;
  descripcion: string;
  clienteProveedorId: string;
  socioId: string;
  estado: "ACTIVO" | "INACTIVO" | "CERRADO";
};

export function EditAsuntoJuridicoSheet({
  asunto,
  isOpen,
  onClose,
}: EditAsuntoJuridicoSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  const [form, setForm] = useState<FormState>({
    nombre: asunto.nombre,
    descripcion: asunto.descripcion ?? "",
    clienteProveedorId: asunto.clienteProveedorId,
    socioId: asunto.socioId,
    estado: asunto.estado as "ACTIVO" | "INACTIVO" | "CERRADO",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [socios, setSocios] = useState<SocioDto[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const updateMutation = useUpdateAsuntoJuridico();
  const clientesQuery = useGetJuridicoClientes();

  // Sync form when asunto prop changes
  useEffect(() => {
    setForm({
      nombre: asunto.nombre,
      descripcion: asunto.descripcion ?? "",
      clienteProveedorId: asunto.clienteProveedorId,
      socioId: asunto.socioId,
      estado: asunto.estado as "ACTIVO" | "INACTIVO" | "CERRADO",
    });
    setErrors({});
  }, [asunto]);

  // Load socios when sheet opens (clientes are reactively fetched by hook)
  useEffect(() => {
    if (!isOpen) return;
    setLoadingOptions(true);
    Promise.all([getAllSociosAction()]).then(
      ([sociosResult]) => {
        if (sociosResult.ok && sociosResult.data) setSocios(sociosResult.data);
        setLoadingOptions(false);
      },
    );
  }, [isOpen]);

  const clientes = clientesQuery.data ?? [];
  const clientesLoading = clientesQuery.isLoading || clientesQuery.isFetching;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      id: asunto.id,
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      clienteProveedorId: form.clienteProveedorId,
      socioId: form.socioId,
      estado: form.estado,
    };

    try {
      updateAsuntoJuridicoSchemaUI.parse(payload);
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
          <SheetTitle>Editar Asunto Jurídico</SheetTitle>
          <SheetDescription>
            Modifica la información del asunto jurídico.
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

          {/* Estado */}
          <div className="space-y-1">
            <Label htmlFor="estado">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.estado}
              onValueChange={handleSelectChange("estado")}
            >
              <SelectTrigger id="estado" className="w-full">
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="INACTIVO">Inactivo</SelectItem>
                <SelectItem value="CERRADO">Cerrado</SelectItem>
              </SelectContent>
            </Select>
            {errors.estado && (
              <p className="text-xs text-red-500">{errors.estado}</p>
            )}
          </div>

          {/* Cliente */}
          <div className="space-y-1">
            <Label htmlFor="clienteProveedorId">
              Cliente <span className="text-red-500">*</span>
            </Label>
            <Combobox
              options={clientes.map((cliente) => ({
                value: cliente.id,
                label: cliente.nombre,
              }))}
              value={form.clienteProveedorId}
              onChange={handleSelectChange("clienteProveedorId")}
              placeholder="Selecciona un cliente"
              searchPlaceholder="Buscar..."
              disabled={loadingOptions || clientesLoading}
            />
            {errors.clienteProveedorId && (
              <p className="text-xs text-red-500">{errors.clienteProveedorId}</p>
            )}
          </div>

          {/* Socio */}
          <div className="space-y-1">
            <Label htmlFor="socioId">
              Socio <span className="text-red-500">*</span>
            </Label>
            <Combobox
              options={socios.map((socio) => ({
                value: socio.id,
                label: socio.nombre,
              }))}
              value={form.socioId}
              onChange={handleSelectChange("socioId")}
              placeholder="Selecciona un socio"
              searchPlaceholder="Buscar..."
              disabled={loadingOptions}
            />
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
            disabled={updateMutation.isPending || loadingOptions}
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
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
