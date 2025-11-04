"use server";
import { revalidatePath } from "next/cache";
import { makeUserService } from "../services/makeUserService";
import { createUserSchema } from "../validators/createUserSchema";
import prisma from "@/core/lib/prisma";

export const createUserAction = async (input: FormData) => {
  const name = input.get("name");
  const email = input.get("email");
  const password = input.get("password");

  let roles: string[] = [];
  try {
    roles = JSON.parse(input.get("roles") as string); // deserializamos el string JSON a su valor original
  } catch (e) {
    return { ok: false, error: "Error al parsear roles enviados" };
  }

  // Validación de entrada
  const parsed = createUserSchema.parse({ name, email, password, roles });

  const userService = makeUserService({ prisma });
  const result = await userService.create(parsed);

  if (!result.ok) return { ok: false, error: result.error.message };

  revalidatePath("/usuarios");
};
