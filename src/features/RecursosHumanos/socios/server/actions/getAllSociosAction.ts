"use server";
import { makeSocioService } from "../services/makeSocioService";
import { toSocioDtoArray } from "../mappers/socioMapper";
import prisma from "@/core/lib/prisma";

export const getAllSociosAction = async () => {
  const socioService = makeSocioService({ prisma });
  const result = await socioService.getAll();

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const sociosDto = toSocioDtoArray(result.value);
  return { ok: true, data: sociosDto };
};
