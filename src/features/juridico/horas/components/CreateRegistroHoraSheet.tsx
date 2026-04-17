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
import { Label } from "@/core/shared/ui/label";
import { Badge } from "@/core/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useCreateRegistroHora } from "../hooks/useCreateRegistroHora.hook";
import { createRegistroHoraSchemaUI } from "../schemas/createRegistroHoraSchema";
import { ZodError } from "zod";
import { getEquiposJuridicosAction } from "@/features/juridico/equipos/server/actions/getEquiposJuridicosAction";
import { getClientesJuridicosAction } from "@/features/juridico/clientes/server/actions/getClientesJuridicosAction";
import { getAsuntosJuridicosAction } from "@/features/juridico/asuntos/server/actions/getAsuntosJuridicosAction";
import { getAllSociosAction } from "@/features/RecursosHumanos/socios/server/actions/getAllSociosAction";
import type { EquipoJuridicoDto } from "@/features/juridico/equipos/server/dtos/EquipoJuridicoDto.dto";
import type { ClienteJuridicoDto } from "@/features/juridico/clientes/server/dtos/ClienteJuridicoDto.dto";
import type { AsuntoJuridicoDto } from "@/features/juridico/asuntos/server/dtos/AsuntoJuridicoDto.dto";
import type { SocioDto } from "@/features/RecursosHumanos/socios/server/dtos/SocioDto.dto";
import { CalendarClock } from "lucide-react";

const MINUTOS_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

interface CreateRegistroHoraSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeekInfo: { ano: number; semana: number };
}

type FormState = {
  equipoJuridicoId: string;
  clienteJuridicoId: string;
  asuntoJuridicoId: string;
  socioId: string;
  horas: string;
  minutos: string;
  descripcion: string;
};

const emptyForm: FormState = {
  equipoJuridicoId: "",
  clienteJuridicoId: "",
  asuntoJuridicoId: "",
  socioId: "",
  horas: "",
  minutos: "0",
  descripcion: "",
};

export function CreateRegistroHoraSheet({
  isOpen,
  onClose,
  currentWeekInfo,
}: CreateRegistroHoraSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [equipos, setEquipos] = useState<EquipoJuridicoDto[]>([]);
  const [clientes, setClientes] = useState<ClienteJuridicoDto[]>([]);
  const [asuntos, setAsuntos] = useState<AsuntoJuridicoDto[]>([]);
  const [socios, setSocios] = useState<SocioDto[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const createMutation = useCreateRegistroHora();

  useEffect(() => {
    if (!isOpen) return;
    setLoadingOptions(true);
    Promise.all([
      getEquiposJuridicosAction(),
      getClientesJuridicosAction(),
      getAsuntosJuridicosAction(),
      getAllSociosAction(),
    ]).then(([equiposRes, clientesRes, asuntosRes, sociosRes]) => {
      if (equiposRes.ok) setEquipos(equiposRes.data);
      if (clientesRes.ok) setClientes(clientesRes.data);
      if (asuntosRes.ok) setAsuntos(asuntosRes.data);
      if (sociosRes.ok && sociosRes.data) setSocios(sociosRes.data);
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

    const horasNum = parseInt(form.horas) || 0;
    const minutosNum = parseInt(form.minutos) || 0;
    const payload = {
      equipoJuridicoId: form.equipoJuridicoId,
      clienteJuridicoId: form.clienteJuridicoId,
      asuntoJuridicoId: form.asuntoJuridicoId,
      socioId: form.socioId,
      horas: horasNum,
      minutos: minutosNum,
      descripcion: form.descripcion || null,
    };

    try {
      createRegistroHoraSchemaUI.parse(payload);
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
          <SheetTitle>Registrar Horas</SheetTitle>
          <SheetDescription>
            Registra tus horas trabajadas para la semana actual.
          </SheetDescription>
        </SheetHeader>

        {/* Current week info */}
        <div className="flex items-center gap-2 px-4 pt-2 pb-1">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Semana actual:</span>
          <Badge variant="outline" className="font-mono text-xs">
            Sem {currentWeekInfo.semana} - {currentWeekInfo.ano}
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          {/* Equipo Jurídico */}
          <div className="space-y-1">
            <Label htmlFor="equipoJuridicoId">
              Equipo Jurídico <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.equipoJuridicoId}
              onValueChange={handleSelectChange("equipoJuridicoId")}
              disabled={loadingOptions}
            >
              <SelectTrigger id="equipoJuridicoId" className="w-full">
                <SelectValue
                  placeholder={
                    loadingOptions ? "Cargando..." : "Selecciona un equipo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {equipos.map((equipo) => (
                  <SelectItem key={equipo.id} value={equipo.id}>
                    {equipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.equipoJuridicoId && (
              <p className="text-xs text-red-500">{errors.equipoJuridicoId}</p>
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
                <SelectValue
                  placeholder={
                    loadingOptions ? "Cargando..." : "Selecciona un cliente"
                  }
                />
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

          {/* Asunto Jurídico */}
          <div className="space-y-1">
            <Label htmlFor="asuntoJuridicoId">
              Asunto Jurídico <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.asuntoJuridicoId}
              onValueChange={handleSelectChange("asuntoJuridicoId")}
              disabled={loadingOptions}
            >
              <SelectTrigger id="asuntoJuridicoId" className="w-full">
                <SelectValue
                  placeholder={
                    loadingOptions ? "Cargando..." : "Selecciona un asunto"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {asuntos.map((asunto) => (
                  <SelectItem key={asunto.id} value={asunto.id}>
                    {asunto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.asuntoJuridicoId && (
              <p className="text-xs text-red-500">{errors.asuntoJuridicoId}</p>
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
                <SelectValue
                  placeholder={
                    loadingOptions ? "Cargando..." : "Selecciona un socio"
                  }
                />
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

          {/* Tiempo trabajado: Horas + Minutos */}
          <div className="space-y-1">
            <Label>
              Tiempo trabajado <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Horas */}
              <div className="space-y-1">
                <Label
                  htmlFor="horas"
                  className="text-xs text-muted-foreground"
                >
                  Horas
                </Label>
                <input
                  id="horas"
                  type="number"
                  step="1"
                  min="0"
                  max="24"
                  value={form.horas}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, horas: e.target.value }));
                    if (errors.horas) {
                      setErrors((prev) => ({ ...prev, horas: undefined }));
                    }
                  }}
                  placeholder="0"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              {/* Minutos */}
              <div className="space-y-1">
                <Label
                  htmlFor="minutos"
                  className="text-xs text-muted-foreground"
                >
                  Minutos
                </Label>
                <Select
                  value={form.minutos}
                  onValueChange={handleSelectChange("minutos")}
                >
                  <SelectTrigger id="minutos" className="w-full">
                    <SelectValue placeholder="0" />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTOS_OPTIONS.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(errors.horas || errors.minutos) && (
              <p className="text-xs text-red-500">
                {errors.horas ?? errors.minutos}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <Label htmlFor="descripcion">Descripción</Label>
            <textarea
              id="descripcion"
              value={form.descripcion}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, descripcion: e.target.value }))
              }
              placeholder="Descripción de las actividades realizadas (opcional)"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || loadingOptions}
          >
            {createMutation.isPending ? "Guardando..." : "Registrar Horas"}
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
