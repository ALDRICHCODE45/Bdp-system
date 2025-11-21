"use server";
import { makeEgresoHistorialService } from "../services/makeEgresoHistorialService";
import { toEgresoHistorialDtoArray } from "../mappers/egresoHistorialMapper";
import prisma from "@/core/lib/prisma";
import { z } from "zod";

const getHistorialSchema = z.object({
  egresoId: z.string().uuid("ID de egreso inválido"),
});

export const getEgresoHistorialAction = async (egresoId: string) => {
  try {
    // Validar entrada
    const parsed = getHistorialSchema.parse({ egresoId });

    // Verificar que el egreso existe
    const egreso = await prisma.egreso.findUnique({
      where: { id: parsed.egresoId },
    });

    if (!egreso) {
      return {
        ok: false,
        error: "Egreso no encontrado",
      };
    }

    // Obtener historial
    const historialService = makeEgresoHistorialService({ prisma });
    const result = await historialService.getHistorialByEgresoId(
      parsed.egresoId
    );

    if (!result.ok) {
      return {
        ok: false,
        error: result.error.message,
      };
    }

    // Convertir a DTOs
    const historialDtos = toEgresoHistorialDtoArray(result.value);

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

