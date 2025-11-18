"use server";
import { revalidatePath } from "next/cache";
import { makeClienteProveedorService } from "../services/makeClienteProveedorService";
import { createClienteProveedorSchema } from "../validators/createClienteProveedorSchema";
import { toClienteProveedorDto } from "../mappers/clienteProveedorMapper";
import prisma from "@/core/lib/prisma";

export const createClienteProveedorAction = async (input: FormData) => {
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
  const parsed = createClienteProveedorSchema.parse({
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
  const result = await clienteProveedorService.create(parsed);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const clienteProveedorDto = toClienteProveedorDto(result.value);
  revalidatePath("/clientes-proovedores");
  return { ok: true, data: clienteProveedorDto };
};
