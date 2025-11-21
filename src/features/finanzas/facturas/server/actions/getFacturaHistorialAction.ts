"use server";
import { makeFacturaHistorialService } from "../services/makeFacturaHistorialService";
import { toFacturaHistorialDtoArray } from "../mappers/facturaHistorialMapper";
import prisma from "@/core/lib/prisma";
import { z } from "zod";

const getHistorialSchema = z.object({
  facturaId: z.string().uuid("ID de factura inválido"),
});

export const getFacturaHistorialAction = async (facturaId: string) => {
  try {
    // Validar entrada
    const parsed = getHistorialSchema.parse({ facturaId });

    // Verificar que la factura existe
    const factura = await prisma.factura.findUnique({
      where: { id: parsed.facturaId },
    });

    if (!factura) {
      return {
        ok: false,
        error: "Factura no encontrada",
      };
    }

    // Obtener historial
    const historialService = makeFacturaHistorialService({ prisma });
    const result = await historialService.getHistorialByFacturaId(
      parsed.facturaId
    );

    if (!result.ok) {
      return {
        ok: false,
        error: result.error.message,
      };
    }

    // Convertir a DTOs
    const historialDtos = toFacturaHistorialDtoArray(result.value);

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

