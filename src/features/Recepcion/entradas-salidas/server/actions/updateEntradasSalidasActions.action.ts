"use server";

import { revalidatePath } from "next/cache";
import { makeEntradasSalidasService } from "../services/makeEntradasSalidasService";
import { updateEntradasSalidasSchema } from "../validators/updateEntradasSalidasSchemas.schema";
import prisma from "@/core/lib/prisma";

export const updateEntradasSalidasAction = async (formData: FormData) => {
  try {
    const id = formData.get("id");
    const visitante = formData.get("visitante");
    const motivo = formData.get("motivo");
    const destinatario = formData.get("destinatario");
    const telefono = formData.get("telefono");
    const correspondencia = formData.get("correspondencia");
    const fecha = formData.get("fecha");
    const hora_entrada = formData.get("hora_entrada");
    const hora_salida = formData.get("hora_salida");

    if (!id || typeof id !== "string") {
      return { ok: false, error: "El ID es requerido" };
    }

    // Construir objeto con los campos proporcionados
    const updateData: Record<string, unknown> = {};

    if (visitante) updateData.visitante = visitante;
    if (destinatario) updateData.destinatario = destinatario;
    if (motivo) updateData.motivo = motivo;
    if (telefono !== null && telefono !== undefined) {
      updateData.telefono = telefono === "" ? null : telefono;
    }
    if (correspondencia !== null && correspondencia !== undefined) {
      updateData.correspondencia = correspondencia === "" ? null : correspondencia;
    }
    if (fecha) updateData.fecha = fecha;
    if (hora_entrada) updateData.hora_entrada = hora_entrada;
    // Manejar hora_salida: si está presente (incluso si es string vacío), incluirla
    if (hora_salida !== null && hora_salida !== undefined) {
      updateData.hora_salida = hora_salida === "" ? null : hora_salida;
    }

    // Validación de entrada
    const parsed = updateEntradasSalidasSchema.parse(updateData);

    const entradasSalidasService = makeEntradasSalidasService({ prisma });
    const result = await entradasSalidasService.update({
      id,
      ...parsed,
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
    return { ok: false, error: "Error al actualizar la entrada o salida" };
  }
};

