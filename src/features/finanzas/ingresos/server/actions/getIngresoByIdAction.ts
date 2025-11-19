"use server";
import { makeIngresoService } from "../services/makeIngresoService";
import { toIngresoDto } from "../mappers/ingresoMapper";
import prisma from "@/core/lib/prisma";

export const getIngresoByIdAction = async (id: string) => {
  try {
    const ingresoService = makeIngresoService({ prisma });
    const result = await ingresoService.getById(id);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    const ingresoDto = toIngresoDto(result.value);
    return { ok: true, data: ingresoDto };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al obtener ingreso",
    };
  }
};

