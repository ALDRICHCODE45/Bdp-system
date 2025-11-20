"use server";
import { revalidatePath } from "next/cache";
import { makeFacturaService } from "../services/makeFacturaService";
import prisma from "@/core/lib/prisma";

export const deleteFacturaAction = async (id: string) => {
  const facturaService = makeFacturaService({ prisma });
  const result = await facturaService.delete(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/facturas");
  return { ok: true };
};

