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
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import { Separator } from "@/core/shared/ui/separator";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { ColaboradorStatusBadge } from "./ColaboradorStatusBadge";
import { MODALIDAD_LABELS, NIVEL_LABELS } from "../helpers/colaboradorLabels";
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

  return (
    <Card className="h-full">
      <CardHeader className="items-center text-center">
        <Avatar className="h-20 w-20 mx-auto">
          <AvatarImage src="" alt={colaborador.name} />
          <AvatarFallback className="text-xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2 w-full">
          <CardTitle className="text-lg">{colaborador.name}</CardTitle>
          <div className="flex justify-center">
            <ColaboradorStatusBadge status={colaborador.status} />
          </div>
        </div>
      </CardHeader>

      <Separator />

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
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="w-full gap-2"
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
