"use server";
import { makeColaboradorHistorialService } from "../services/makeColaboradorHistorialService";
import { toColaboradorHistorialDtoArray } from "../mappers/colaboradorHistorialMapper";
import prisma from "@/core/lib/prisma";
import { z } from "zod";

const getHistorialSchema = z.object({
  colaboradorId: z.string().uuid("ID de colaborador inválido"),
});

export const getColaboradorHistorialAction = async (colaboradorId: string) => {
  try {
    // Validar entrada
    const parsed = getHistorialSchema.parse({ colaboradorId });

    // Verificar que el colaborador existe
    const colaborador = await prisma.colaborador.findUnique({
      where: { id: parsed.colaboradorId },
    });

    if (!colaborador) {
      return {
        ok: false,
        error: "Colaborador no encontrado",
      };
    }

    // Obtener historial
    const historialService = makeColaboradorHistorialService({ prisma });
    const result = await historialService.getHistorialByColaboradorId(
      parsed.colaboradorId
    );

    if (!result.ok) {
      return {
        ok: false,
        error: result.error.message,
      };
    }

    // Convertir a DTOs
    const historialDtos = toColaboradorHistorialDtoArray(result.value);

    return {
      ok: true,
      data: historialDtos,
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
        error instanceof Error ? error.message : "Error al obtener historial",
    };
  }
};

