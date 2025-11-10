"use server";
import { makeColaboradorService } from "../services/makeColaboradorService";
import { toColaboradorDtoArray } from "../mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";

export const getAllColaboradoresAction = async () => {
  const colaboradorService = makeColaboradorService({ prisma });
  const result = await colaboradorService.getAll();

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const colaboradoresDto = toColaboradorDtoArray(result.value);
  return { ok: true, data: colaboradoresDto };
};
