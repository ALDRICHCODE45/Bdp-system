"use server";
import { revalidatePath } from "next/cache";
import { makeSocioService } from "../services/makeSocioService";
import prisma from "@/core/lib/prisma";

export const deleteSocioAction = async (id: string) => {
  const socioService = makeSocioService({ prisma });
  const result = await socioService.delete(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/socios");
  return { ok: true };
};

