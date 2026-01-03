"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/core/shared/ui/avatar";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Card } from "@/core/shared/ui/card";
import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { calculateAge } from "../helpers/formatColaboradorProfile";
import { Edit, Mail, Phone, MapPin, Calendar } from "lucide-react";

interface ColaboradorProfileHeaderProps {
  colaborador: ColaboradorDto;
  onEdit?: () => void;
}

/**
 * Header del perfil con avatar, nombre, puesto y datos de contacto principales
 * Diseño mejorado similar a la imagen de referencia
 */
export function ColaboradorProfileHeader({
  colaborador,
  onEdit,
}: ColaboradorProfileHeaderProps) {
  const age = calculateAge(colaborador.fechaNacimiento);

  // Generar iniciales para el avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src="" alt={colaborador.name} />
                <AvatarFallback className="text-2xl md:text-3xl font-semibold">
                  {getInitials(colaborador.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Información Principal */}
          <div className="flex-1 space-y-4">
            {/* Nombre y Puesto */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {colaborador.name}
                  </h1>
                  <Badge variant="outline" className="w-fit">
                    {colaborador.puesto}
                  </Badge>
                </div>
                {colaborador.correo && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm md:text-base">
                      {colaborador.correo}
                    </span>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              {onEdit && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Cards de Información Rápida */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {age !== null && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Edad
              </span>
            </div>
            <div className="text-2xl font-bold">{age}</div>
          </Card>
        )}
        {colaborador.direccion && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Ubicación
              </span>
            </div>
            <div className="text-sm font-semibold line-clamp-2">
              {colaborador.direccion}
            </div>
          </Card>
        )}
        {colaborador.telefono && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Contacto
              </span>
            </div>
            <div className="text-sm font-semibold">{colaborador.telefono}</div>
          </Card>
        )}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase">
              ID
            </span>
          </div>
          <div className="text-xs font-mono font-semibold break-all">
            {colaborador.id}
          </div>
        </Card>
      </div>
    </div>
  );
}
