"use server";

import { revalidatePath } from "next/cache";
import { makeEntradasSalidasService } from "../services/makeEntradasSalidasService";
import { createEntradasSalidasSchema } from "../validators/createEntradasSalidasSchemas.schema";
import prisma from "@/core/lib/prisma";

export const createEntradasSalidasAction = async (formData: FormData) => {
  try {
    const visitante = formData.get("visitante");
    const motivo = formData.get("motivo");
    const destinatario = formData.get("destinatario");
    const telefono = formData.get("telefono");
    const correspondencia = formData.get("correspondencia");
    const fecha = formData.get("fecha");
    const hora_entrada = formData.get("hora_entrada");
    const hora_salida = formData.get("hora_salida");

    // Validación de entrada
    const parsed = createEntradasSalidasSchema.parse({
      visitante,
      motivo,
      destinatario,
      telefono: telefono === "" ? null : telefono,
      correspondencia: correspondencia === "" ? null : correspondencia,
      fecha,
      hora_entrada,
      hora_salida,
    });

    const entradasSalidasService = makeEntradasSalidasService({ prisma });
    const result = await entradasSalidasService.create(parsed);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    revalidatePath("/entradas-salidas");
    return { ok: true, data: result.value };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Error al crear la entrada o salida" };
  }
};
