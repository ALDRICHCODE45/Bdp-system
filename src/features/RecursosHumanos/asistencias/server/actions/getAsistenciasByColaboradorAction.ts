"use server";

import { makeAsistenciaService } from "../services/makeAsistenciaService";
import prisma from "@/core/lib/prisma";
import { z } from "zod";

const getAsistenciasByColaboradorSchema = z.object({
  correo: z.string().email("Correo inválido"),
});

export const getAsistenciasByColaboradorAction = async (correo: string) => {
  try {
    // Validar entrada
    const parsed = getAsistenciasByColaboradorSchema.parse({ correo });

    // Verificar que el colaborador existe
    const colaborador = await prisma.colaborador.findUnique({
      where: { correo: parsed.correo },
    });

    if (!colaborador) {
      return {
        ok: false,
        error: "Colaborador no encontrado",
      };
    }

    // Obtener asistencias
    const asistenciaService = makeAsistenciaService({ prisma });
    const result = await asistenciaService.getByCorreo(parsed.correo);

    if (!result.ok) {
      return {
        ok: false,
        error: result.error.message,
      };
    }

    // Convertir fechas a strings ISO para serialización
    const asistenciasSerializadas = result.value.map((asistencia) => ({
      ...asistencia,
      fecha: asistencia.fecha.toISOString(),
    }));

    return {
      ok: true,
      data: asistenciasSerializadas,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message || "Error de validación",
      };
    }

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener asistencias del colaborador",
    };
  }
};

