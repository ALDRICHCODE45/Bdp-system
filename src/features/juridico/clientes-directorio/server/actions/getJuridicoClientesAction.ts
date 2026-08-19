"use server";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { TryCatch } from "@/core/shared/helpers/tryCatch";
import type {
  JuridicoClienteDirectorioDto,
  JuridicoClienteDirectorioDtoArray,
} from "../dtos/JuridicoClienteDirectorioDto.dto";

/**
 * Returns the subset of `ClienteProveedor` rows that are valid as juridico
 * clients: `tipo: 'CLIENTE'` and `activo: true`.
 *
 * Reuses `ClienteProveedor` from finanzas — does NOT introduce a parallel
 * CRUD module. Permission guard prevents juridico users from leaking
 * PROVEEDOR rows via the unfiltered finanzas actions.
 */
export const getJuridicoClientesAction = async (): Promise<
  { ok: true; data: JuridicoClienteDirectorioDtoArray } | { ok: false; error: string }
> => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-asuntos"].acceder,
      PermissionActions["juridico-horas"].registrar,
    ],
    "No tienes permiso para ver el directorio de clientes jurídicos"
  );

  const result = await TryCatch(
    prisma.clienteProveedor.findMany({
      where: { tipo: "CLIENTE", activo: true },
      select: { id: true, nombre: true, rfc: true },
      orderBy: { nombre: "asc" },
    })
  );

  if (!result.ok) return { ok: false, error: result.error.message };
  return { ok: true, data: result.value satisfies JuridicoClienteDirectorioDto[] };
};