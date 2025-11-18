"use server";
import { revalidatePath } from "next/cache";
import { makeClienteProveedorService } from "../services/makeClienteProveedorService";
import prisma from "@/core/lib/prisma";

export const deleteClienteProveedorAction = async (id: string) => {
  const clienteProveedorService = makeClienteProveedorService({ prisma });
  const result = await clienteProveedorService.delete(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/clientes-proovedores");
  return { ok: true };
};
