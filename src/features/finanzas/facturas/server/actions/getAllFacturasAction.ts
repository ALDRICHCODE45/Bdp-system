"use server";
import { makeFacturaService } from "../services/makeFacturaService";
import { toFacturaDtoArray } from "../mappers/facturaMapper";
import prisma from "@/core/lib/prisma";

export const getAllFacturasAction = async () => {
  const facturaService = makeFacturaService({ prisma });
  const result = await facturaService.getAll();

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const facturasDto = toFacturaDtoArray(result.value);
  return { ok: true, data: facturasDto };
};

