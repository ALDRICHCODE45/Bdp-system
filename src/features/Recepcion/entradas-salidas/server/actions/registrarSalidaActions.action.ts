"use server";

import { revalidatePath } from "next/cache";
import { makeEntradasSalidasService } from "../services/makeEntradasSalidasService";
import { registrarSalidaSchema } from "../validators/registrarSalidaSchemas.schema";
import prisma from "@/core/lib/prisma";

export const registrarSalidaAction = async (formData: FormData) => {
  try {
    const id = formData.get("id");
    const hora_salida = formData.get("hora_salida");

    if (!id || typeof id !== "string") {
      return { ok: false, error: "El ID es requerido" };
    }

    if (!hora_salida) {
      return { ok: false, error: "La hora de salida es requerida" };
    }

    // Validar la hora de salida
    const parsed = registrarSalidaSchema.parse({
      hora_salida,
    });

    const entradasSalidasService = makeEntradasSalidasService({ prisma });
    const result = await entradasSalidasService.registrarSalida({
      id,
      hora_salida: parsed.hora_salida,
    });

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    revalidatePath("/entradas-salidas");
    return { ok: true, data: result.value };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Error al registrar la salida" };
  }
};
