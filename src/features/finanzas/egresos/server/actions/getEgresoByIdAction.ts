"use server";
import { makeEgresoService } from "../services/makeEgresoService";
import { toEgresoDto } from "../mappers/egresoMapper";
import prisma from "@/core/lib/prisma";
import { z } from "zod";

export const getEgresoByIdAction = async (id: string) => {
  // Validar el ID
  const idSchema = z.string().uuid("ID de egreso inválido");

  try {
    idSchema.parse(id);
  } catch (error) {
    return { ok: false, error: "ID de egreso inválido" };
  }

  const egresoService = makeEgresoService({ prisma });
  const result = await egresoService.getById(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const egresoDto = toEgresoDto(result.value);
  return { ok: true, data: egresoDto };
};

