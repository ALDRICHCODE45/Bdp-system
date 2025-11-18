"use server";
import { makeClienteProveedorService } from "../services/makeClienteProveedorService";
import { toClienteProveedorDtoArray } from "../mappers/clienteProveedorMapper";
import prisma from "@/core/lib/prisma";

export const getAllClientesProveedoresAction = async () => {
  const clienteProveedorService = makeClienteProveedorService({ prisma });
  const result = await clienteProveedorService.getAll();

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const clientesProveedoresDto = toClienteProveedorDtoArray(result.value);
  return { ok: true, data: clientesProveedoresDto };
};
