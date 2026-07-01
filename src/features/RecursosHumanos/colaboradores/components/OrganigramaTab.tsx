"use client";

import { Building2, Info } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/shared/ui/tooltip";

import { OrgTree } from "./OrgTree";
import type { OrgTreeDto } from "../server/dtos/OrgTreeDto.dto";

interface OrganigramaTabProps {
  tree: OrgTreeDto;
}

/**
 * P4 — cap7 employee-org-tree profile tab.
 *
 * Renders the 2-level org tree grouped by `socioId`. The section label is
 * "Reportes directos (Socio)" per spec cap7 req5 with a tooltip explaining
 * the 2-level constraint.
 *
 * Why 2 levels: this feature is implemented over the existing `socioId` FK
 * (no self-FK yet). The design preserves the capability to extend to a
 * multi-level tree by adding an additive `jefeDirectoId` self-FK in a
 * future migration (spec cap7 req6 — explicit extension path).
 */
export function OrganigramaTab({ tree }: OrganigramaTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Reportes directos (Socio)
            </CardTitle>
            <CardDescription>
              Vista agrupada por socio: 2 niveles (socio → colaborador).
            </CardDescription>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Información del organigrama"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Esta vista muestra 2 niveles (socio → colaborador). Para
              profundizar a varios niveles se requiere un cambio aditivo de
              esquema (`jefeDirectoId`).
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <OrgTree tree={tree} />
      </CardContent>
    </Card>
  );
}