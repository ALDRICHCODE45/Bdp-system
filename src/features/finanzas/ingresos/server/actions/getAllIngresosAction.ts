"use server";
import { makeIngresoService } from "../services/makeIngresoService";
import { toIngresoDtoArray } from "../mappers/ingresoMapper";
import prisma from "@/core/lib/prisma";

export const getAllIngresosAction = async () => {
  try {
    const ingresoService = makeIngresoService({ prisma });
    const result = await ingresoService.getAll();

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    const ingresosDto = toIngresoDtoArray(result.value);
    return { ok: true, data: ingresosDto };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al obtener ingresos",
    };
  }
};

