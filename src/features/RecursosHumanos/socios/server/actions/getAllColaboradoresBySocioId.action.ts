"use server";
import { makeSocioService } from "../services/makeSocioService";
import prisma from "@/core/lib/prisma";

export const getAllColaboradoresBySocioId = async (socioId: string) => {
  const socioService = makeSocioService({ prisma });
  const result = await socioService.getColaboradoresBySocioId(socioId);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const colaboradores = result.value;
  return { ok: true, data: colaboradores };
};
