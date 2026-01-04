"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/core/shared/ui/avatar";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Card } from "@/core/shared/ui/card";
import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { calculateAge } from "../helpers/formatColaboradorProfile";
import { Edit, Mail, Phone, MapPin, Calendar, Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "@/core/shared/hooks/use-copy-to-clipboard";
import { useEffect } from "react";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { ColaboradorProfileHeaderCardBasicInformation } from "./ColaboradorProfileHederCardBasicInformation";

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
          <ColaboradorProfileHeaderCardBasicInformation
            content={age.toString()}
            Icon={Calendar}
            title="EDAD"
            key={age}
          />
        )}
        {colaborador.direccion && (
          <ColaboradorProfileHeaderCardBasicInformation
            content={colaborador.direccion}
            Icon={MapPin}
            title="Ubicación"
            key={colaborador.direccion}
          />
        )}
        {colaborador.telefono && (
          <ColaboradorProfileHeaderCardBasicInformation
            content={colaborador.telefono}
            Icon={Phone}
            title="Contacto"
            key={colaborador.telefono}
          />
        )}

        <ColaboradorProfileHeaderCardBasicInformation
          content={colaborador.id}
          Icon={Mail}
          title="ID"
          key={colaborador.id}
        />
      </div>
    </div>
  );
}
