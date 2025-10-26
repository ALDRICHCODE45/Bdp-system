"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
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
import { Checkbox } from "@/core/shared/ui/checkbox";
import { useState } from "react";

interface ClienteProveedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add";
}

interface ClienteProveedorFormData {
  nombre: string;
  email: string;
  telefono: string;
  tipo: "cliente" | "proveedor";
  activo: boolean;
}

export const ClienteProveedorModal = ({
  isOpen,
  onClose,
  mode,
}: ClienteProveedorModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClienteProveedorFormData>({
    nombre: "",
    email: "",
    telefono: "",
    tipo: "cliente",
    activo: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aquí iría la lógica para crear el cliente/proveedor
      console.log("Creando cliente/proveedor:", formData);

      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onClose();
      // Aquí podrías refrescar la tabla o mostrar un mensaje de éxito
    } catch (error) {
      console.error("Error creando cliente/proveedor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof ClienteProveedorFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" && "Agregar Cliente/Proveedor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Nombre completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                placeholder="Número de teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "cliente" | "proveedor") =>
                  handleInputChange("tipo", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="proveedor">Proveedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) =>
                handleInputChange("activo", checked as boolean)
              }
            />
            <Label htmlFor="activo">Activo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
