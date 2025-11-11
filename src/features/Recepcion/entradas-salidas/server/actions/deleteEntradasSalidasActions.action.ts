"use server";

import { revalidatePath } from "next/cache";
import { makeEntradasSalidasService } from "../services/makeEntradasSalidasService";
import prisma from "@/core/lib/prisma";

export const deleteEntradasSalidasAction = async (id: string) => {
  try {
    const entradasSalidasService = makeEntradasSalidasService({ prisma });
    const result = await entradasSalidasService.delete(id);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    revalidatePath("/entradas-salidas");
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Error al eliminar la entrada o salida" };
  }
};

