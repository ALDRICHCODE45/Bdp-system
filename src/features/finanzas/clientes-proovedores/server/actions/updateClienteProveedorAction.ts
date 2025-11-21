"use server";
import { revalidatePath } from "next/cache";
import { makeClienteProveedorService } from "../services/makeClienteProveedorService";
import { updateClienteProveedorSchema } from "../validators/updateClienteProveedorSchema";
import { toClienteProveedorDto } from "../mappers/clienteProveedorMapper";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";

export const updateClienteProveedorAction = async (input: FormData) => {
  // Obtener usuario autenticado
  const session = await auth();
  const usuarioId = session?.user?.id || null;
  const id = input.get("id");
  const nombre = input.get("nombre");
  const rfc = input.get("rfc");
  const tipo = input.get("tipo");
  const direccion = input.get("direccion");
  const telefono = input.get("telefono");
  const email = input.get("email");
  const contacto = input.get("contacto");
  const numeroCuenta = input.get("numeroCuenta") || null;
  const clabe = input.get("clabe") || null;
  const banco = input.get("banco") || null;
  const activo = input.get("activo") === "true";
  const fechaRegistroString = input.get("fechaRegistro");
  const notas = input.get("notas") || null;
  const socioId = input.get("socioId") || null;

  const fechaRegistro = fechaRegistroString
    ? new Date(fechaRegistroString as string)
    : new Date();

  // Validación de entrada
  const parsed = updateClienteProveedorSchema.parse({
    id,
    nombre,
    rfc,
    tipo,
    direccion,
    telefono,
    email,
    contacto,
    numeroCuenta,
    clabe,
    banco,
    activo,
    fechaRegistro,
    notas,
    socioId,
  });

  const clienteProveedorService = makeClienteProveedorService({ prisma });
  const result = await clienteProveedorService.update({
    ...parsed,
    usuarioId,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const clienteProveedorDto = toClienteProveedorDto(result.value);
  revalidatePath("/clientes-proovedores");
  return { ok: true, data: clienteProveedorDto };
};
