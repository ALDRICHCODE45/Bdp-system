"use client";

import { Edit, Mail, MapPin, Phone, Cake, Heart, FileText, Calendar } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/shared/ui/avatar";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import {
  Card,
  CardContent,
} from "@/core/shared/ui/card";
import { Separator } from "@/core/shared/ui/separator";
import { cn } from "@/core/lib/utils";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { ColaboradorStatusBadge } from "./ColaboradorStatusBadge";
import {
  MODALIDAD_LABELS,
  NIVEL_LABELS,
} from "../helpers/colaboradorLabels";
import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";

interface ProfileIdentityRailProps {
  colaborador: ColaboradorDto;
  onEdit?: () => void;
}

/**
 * Left identity rail (spec cap2 req3): avatar, full name, status badge,
 * corporate email, and an Editar button gated by `colaboradores:editar`.
 *
 * Only renders identity fields present on the existing DTO — nothing is
 * fabricated. Nulls render as muted "No especificado" placeholders (spec cap4
 * req6: "no fabricated placeholder data" — we honor that for optional fields
 * by rendering honest placeholders that NEVER look like real data).
 */
export function ProfileIdentityRail({
  colaborador,
  onEdit,
}: ProfileIdentityRailProps) {
  const initials = getInitials(colaborador.name);
  const isActive = colaborador.status === "CONTRATADO";

  return (
    <Card className="overflow-hidden pt-0">
      {/* Header banner: a subtle navy gradient stripe behind the avatar — the
          "soul" accent that replaces the flat monochrome header. Navy conveys
          the trust/authority a law firm brand wants (vs. HoundFe's tech
          orange). The avatar overlaps the banner bottom edge for depth. */}
      <div className="relative h-20 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-700 dark:from-blue-950 dark:via-blue-900 dark:to-slate-800">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-4 ring-card">
              <AvatarImage src="" alt={colaborador.name} />
              <AvatarFallback className="bg-blue-900 text-lg font-semibold text-white dark:bg-blue-800">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Status dot: green when active, muted otherwise (HoundFe cue). */}
            <span
              className={cn(
                "absolute bottom-1 right-1 h-4 w-4 rounded-full ring-2 ring-card",
                isActive ? "bg-emerald-500" : "bg-muted-foreground"
              )}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="mt-12 px-6 text-center">
        <h2 className="text-lg font-semibold leading-tight">
          {colaborador.name}
        </h2>
        {colaborador.puesto && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {colaborador.puesto}
          </p>
        )}

        {/* Category badge row (HoundFe cue): departamento / estado / modalidad,
            each with soft semantic color. Only rendered when the field exists —
            no fabricated placeholders. */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {colaborador.departamento && (
            <Badge
              variant="secondary"
              className="rounded-full border-0 bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
            >
              {colaborador.departamento}
            </Badge>
          )}
          <ColaboradorStatusBadge status={colaborador.status} />
          {colaborador.modalidad && (
            <Badge
              variant="secondary"
              className="rounded-full border-0 bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
            >
              {MODALIDAD_LABELS[colaborador.modalidad] ?? colaborador.modalidad}
            </Badge>
          )}
        </div>
      </div>

      <Separator className="mt-4" />

      <CardContent className="space-y-4">
        {/* Corporate email — kept in the rail because it's the canonical
            identifier for the Asistencia FK (CC6). The CC6 semantics are
            preserved by never exposing this field as editable here. */}
        {colaborador.correo && (
          <RailRow icon={Mail} label="Correo corporativo" value={colaborador.correo} />
        )}

        {/* Identity fields present on the DTO. We never substitute a fake
            value — null = "No especificado" placeholder. */}
        {colaborador.telefono && (
          <RailRow icon={Phone} label="Teléfono" value={colaborador.telefono} />
        )}
        {colaborador.direccion && (
          <RailRow icon={MapPin} label="Ubicación" value={colaborador.direccion} />
        )}
        {colaborador.fechaNacimiento && (
          <RailRow
            icon={Cake}
            label="Cumpleaños"
            value={formatDatePlain(colaborador.fechaNacimiento)}
          />
        )}
        {colaborador.estadoCivil && (
          <RailRow
            icon={Heart}
            label="Estado civil"
            value={colaborador.estadoCivil}
          />
        )}
        {colaborador.tipoContrato && (
          <RailRow
            icon={FileText}
            label="Tipo de contrato"
            value={labelize(colaborador.tipoContrato)}
          />
        )}
        {colaborador.fechaIngreso && (
          <RailRow
            icon={Calendar}
            label="Fecha de ingreso"
            value={formatDatePlain(colaborador.fechaIngreso)}
          />
        )}
        {colaborador.modalidad && (
          <RailRow
            icon={MapPin}
            label="Modalidad"
            value={MODALIDAD_LABELS[colaborador.modalidad] ?? colaborador.modalidad}
          />
        )}
        {colaborador.nivel && (
          <RailRow
            icon={FileText}
            label="Nivel"
            value={NIVEL_LABELS[colaborador.nivel] ?? colaborador.nivel}
          />
        )}

        <Separator />

        {/* Editar is gated by `colaboradores:editar`. The <PermissionGuard>
            defaults to "any" semantics — only one permission in the list, so
            this is effectively a single-permission gate. */}
        <PermissionGuard
          permissions={[PermissionActions.colaboradores.editar]}
        >
          <Button
            size="sm"
            onClick={onEdit}
            className="w-full gap-2 bg-blue-900 text-white hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </PermissionGuard>

        {/* No-Badge fallback note: EN_LICENCIA was added in P0 and is
            displayed via the standard badge above (cap1 req7 keeps the
            token count ≤ 3: success/warning/muted). */}
        {colaborador.status === "EN_LICENCIA" && (
          <p className="text-xs text-muted-foreground text-center">
            <Badge variant="warning-outline" className="text-xs">
              Licencia activa
            </Badge>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-sm text-foreground break-words">{value}</div>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function formatDatePlain(iso: string): string {
  // Avoid leaking the full locale-formatted phrase into small UI rows; we
  // want a compact presentation here and the design delegates full date
  // formatting to the helper bundle as needed.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// typeContrato comes from a Prisma enum serialized to string. We don't yet
// own a label map for TipoContrato, so we map the snake-case values to a
// readable Spanish label. Once a centralized label map exists, this can
// collapse into it (kept here so the rail is self-contained for P2).
function labelize(enumValue: string): string {
  const map: Record<string, string> = {
    INDEFINIDO: "Indefinido",
    TEMPORAL: "Temporal",
    POR_OBRA: "Por obra",
    PRACTICAS: "Prácticas",
    HONORARIOS: "Honorarios",
  };
  return map[enumValue] ?? enumValue;
}
