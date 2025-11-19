"use server";
import { revalidatePath } from "next/cache";
import { makeIngresoService } from "../services/makeIngresoService";
import prisma from "@/core/lib/prisma";

export const deleteIngresoAction = async (id: string) => {
  try {
    const ingresoService = makeIngresoService({ prisma });
    const result = await ingresoService.delete(id);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    revalidatePath("/ingresos");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al eliminar ingreso",
    };
  }
};

