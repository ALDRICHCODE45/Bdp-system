"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/core/shared/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/shared/ui/tooltip";
import { Mail, Briefcase, Building2, User, CalendarDays, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { ColaboradorStatusBadge } from "./ColaboradorStatusBadge";
import { NIVEL_LABELS, MODALIDAD_LABELS } from "../helpers/colaboradorLabels";

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return format(parseISO(iso), "d MMM yyyy", { locale: es });
  } catch {
    return null;
  }
}

/**
 * Cards view of the colaboradores listing (cap1 req4).
 *
 * 1 col on mobile, 2 on md, 3 on xl — preserves the slim-table order so the
 * user can switch between views without losing context.
 */
interface ColaboradoresCardsViewProps {
  data: ColaboradorDto[];
}

export function ColaboradoresCardsView({ data }: ColaboradoresCardsViewProps) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-md">
        No se encontraron colaboradores.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((c) => {
        const fechaIngreso = formatDate(c.fechaIngreso);
        return (
          <Card key={c.id} className="overflow-hidden">
            <CardHeader className="pb-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="text-sm font-semibold truncate">
                        {c.name}
                      </h3>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{c.name}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 min-w-0">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{c.correo}</span>
                  </div>
                </div>
                <ColaboradorStatusBadge status={c.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex items-center gap-2 text-xs">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{c.puesto || "—"}</span>
                {c.nivel && (
                  <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                    {NIVEL_LABELS[c.nivel] ?? c.nivel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {c.departamento || "Sin departamento"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {c.socio ? c.socio.nombre : "Sin socio asignado"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {fechaIngreso ?? "Sin fecha de ingreso"}
                </span>
              </div>
              {c.modalidad && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {MODALIDAD_LABELS[c.modalidad] ?? c.modalidad}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}