"use server";
import { makeUserService } from "../services/makeUserService";
import { createUserSchema } from "../validators/createUserSchema";
import prisma from "@/core/lib/prisma";

export const createUserAction = async (input: FormData) => {
  //Validacion de entrada
  const parsed = createUserSchema.parse(input);

  const userService = makeUserService({ prisma });
  const result = await userService.create(parsed);
  // TODO: Implementar la lógica de creación de usuario
  if (!result.ok) return { ok: false, error: result.error.message };

  const dataToResult = {
    ok: true,
    data: result.value,
  };
  console.log({ dataToResult });
};
