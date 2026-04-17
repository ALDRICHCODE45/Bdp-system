"use server";
import { makeClienteJuridicoService } from "../services/makeClienteJuridicoService";
import { toClienteJuridicoDtoArray } from "../mappers/clienteJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const getClientesJuridicosAction = async () => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-clientes"].acceder,
      PermissionActions["juridico-clientes"].gestionar,
      PermissionActions["juridico-horas"].registrar,
    ],
    "No tienes permiso para ver clientes jurídicos"
  );

  const service = makeClienteJuridicoService({ prisma });
  const result = await service.getAll();

  if (!result.ok) return { ok: false as const, error: result.error.message };
  return { ok: true as const, data: toClienteJuridicoDtoArray(result.value) };
};
