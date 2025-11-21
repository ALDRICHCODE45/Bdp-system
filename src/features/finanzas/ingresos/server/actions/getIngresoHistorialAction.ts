"use server";
import { makeIngresoHistorialService } from "../services/makeIngresoHistorialService";
import { toIngresoHistorialDtoArray } from "../mappers/ingresoHistorialMapper";
import prisma from "@/core/lib/prisma";
import { z } from "zod";

const getHistorialSchema = z.object({
  ingresoId: z.string().uuid("ID de ingreso inválido"),
});

export const getIngresoHistorialAction = async (ingresoId: string) => {
  try {
    // Validar entrada
    const parsed = getHistorialSchema.parse({ ingresoId });

    // Verificar que el ingreso existe
    const ingreso = await prisma.ingreso.findUnique({
      where: { id: parsed.ingresoId },
    });

    if (!ingreso) {
      return {
        ok: false,
        error: "Ingreso no encontrado",
      };
    }

    // Obtener historial
    const historialService = makeIngresoHistorialService({ prisma });
    const result = await historialService.getHistorialByIngresoId(
      parsed.ingresoId
    );

    if (!result.ok) {
      return {
        ok: false,
        error: result.error.message,
      };
    }

    // Convertir a DTOs
    const historialDtos = toIngresoHistorialDtoArray(result.value);

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

