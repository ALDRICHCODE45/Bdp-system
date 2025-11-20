"use server";
import { makeFacturaService } from "../services/makeFacturaService";
import { toFacturaDto } from "../mappers/facturaMapper";
import prisma from "@/core/lib/prisma";

export const getFacturaByIdAction = async (id: string) => {
  const facturaService = makeFacturaService({ prisma });
  const result = await facturaService.getById(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const facturaDto = toFacturaDto(result.value);
  return { ok: true, data: facturaDto };
};

