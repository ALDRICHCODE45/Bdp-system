"use server";
import { revalidatePath } from "next/cache";
import { makeClienteJuridicoService } from "../services/makeClienteJuridicoService";
import { createClienteJuridicoSchema } from "../validators/createClienteJuridicoSchema";
import { toClienteJuridicoDto } from "../mappers/clienteJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const createClienteJuridicoAction = async (input: unknown) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-clientes"].crear,
      PermissionActions["juridico-clientes"].gestionar,
    ],
    "No tienes permiso para crear clientes jurídicos"
  );

  const parsed = createClienteJuridicoSchema.parse(input);
  const service = makeClienteJuridicoService({ prisma });
  const result = await service.create(parsed);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/clientes");
  return { ok: true as const, data: toClienteJuridicoDto(result.value) };
};
