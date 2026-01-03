"use client";

import { useQuery } from "@tanstack/react-query";
import { getAsistenciasByColaboradorAction } from "@/features/RecursosHumanos/asistencias/server/actions/getAsistenciasByColaboradorAction";
import { AsistenciaDto } from "@/features/RecursosHumanos/asistencias/server/Dtos/AsistenciaDto.dto";

export function useColaboradorAsistencias(correo: string) {
  return useQuery({
    queryKey: ["colaborador-asistencias", correo],
    queryFn: async () => {
      const result = await getAsistenciasByColaboradorAction(correo);

      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar asistencias");
      }

      // Convertir fechas ISO string de vuelta a Date objects
      const asistencias: AsistenciaDto[] = result.data.map((asistencia) => ({
        ...asistencia,
        fecha:
          typeof asistencia.fecha === "string"
            ? new Date(asistencia.fecha)
            : asistencia.fecha,
      }));

      return asistencias;
    },
    enabled: !!correo,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
