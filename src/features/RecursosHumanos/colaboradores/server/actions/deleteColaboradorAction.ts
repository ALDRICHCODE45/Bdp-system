"use server";
import { revalidatePath } from "next/cache";
import { makeColaboradorService } from "../services/makeColaboradorService";
import prisma from "@/core/lib/prisma";

export const deleteColaboradorAction = async (id: string) => {
  const colaboradorService = makeColaboradorService({ prisma });
  const result = await colaboradorService.delete(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/colaboradores");
  return { ok: true };
};

