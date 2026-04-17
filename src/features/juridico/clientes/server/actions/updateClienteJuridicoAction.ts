"use server";
import { revalidatePath } from "next/cache";
import { makeClienteJuridicoService } from "../services/makeClienteJuridicoService";
import { updateClienteJuridicoSchema } from "../validators/updateClienteJuridicoSchema";
import { toClienteJuridicoDto } from "../mappers/clienteJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const updateClienteJuridicoAction = async (input: unknown) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-clientes"].editar,
      PermissionActions["juridico-clientes"].gestionar,
    ],
    "No tienes permiso para editar clientes jurídicos"
  );

  const parsed = updateClienteJuridicoSchema.parse(input);
  const service = makeClienteJuridicoService({ prisma });
  const result = await service.update(parsed);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/clientes");
  return { ok: true as const, data: toClienteJuridicoDto(result.value) };
};
