"use server";
import { revalidatePath } from "next/cache";
import { makeColaboradorService } from "../services/makeColaboradorService";
import { createColaboradorSchema } from "../validators/createColaboradorSchema";
import { toColaboradorDto } from "../mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";

export const createColaboradorAction = async (input: FormData) => {
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
  const parsed = createColaboradorSchema.parse({
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
  const result = await colaboradorService.create(parsed);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const colaboradorDto = toColaboradorDto(result.value);
  revalidatePath("/colaboradores");
  return { ok: true, data: colaboradorDto };
};
