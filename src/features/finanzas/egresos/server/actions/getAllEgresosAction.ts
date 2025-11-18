"use server";
import { makeEgresoService } from "../services/makeEgresoService";
import { toEgresoDtoArray } from "../mappers/egresoMapper";
import prisma from "@/core/lib/prisma";

export const getAllEgresosAction = async () => {
  const egresoService = makeEgresoService({ prisma });
  const result = await egresoService.getAll();

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const egresosDto = toEgresoDtoArray(result.value);
  return { ok: true, data: egresosDto };
};

