"use server";
import { revalidatePath } from "next/cache";
import { makeColaboradorService } from "../services/makeColaboradorService";
import { updateColaboradorSchema } from "../validators/updateColaboradorSchema";
import { toColaboradorDto } from "../mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";

export const updateColaboradorAction = async (input: FormData) => {
  // Obtener usuario autenticado
  const session = await auth();
  const usuarioId = session?.user?.id || null;
  const id = input.get("id");
  const name = input.get("name");
  const correo = input.get("correo");
  const puesto = input.get("puesto");
  const status = input.get("status");
  const imss = input.get("imss") === "true";
  const socioId = input.get("socioId") || null;
  const banco = input.get("banco");
  const clabe = input.get("clabe");
  const sueldo = input.get("sueldo");

  let activos: string[] = [];
  try {
    const activosString = input.get("activos");
    if (
      activosString &&
      typeof activosString === "string" &&
      activosString.trim() !== ""
    ) {
      const parsed = JSON.parse(activosString);
      // Asegurar que sea un array
      activos = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    return { ok: false, error: "Error al parsear activos" };
  }

  // Validación de entrada
  const parsed = updateColaboradorSchema.parse({
    id,
    name,
    correo,
    puesto,
    status,
    imss,
    socioId: socioId === "" ? null : socioId,
    banco,
    clabe,
    sueldo: sueldo ? parseFloat(sueldo as string) : 0,
    activos,
  });

  const colaboradorService = makeColaboradorService({ prisma });
  const result = await colaboradorService.update({
    ...parsed,
    usuarioId,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const colaboradorDto = toColaboradorDto(result.value);
  revalidatePath("/colaboradores");
  return { ok: true, data: colaboradorDto };
};
