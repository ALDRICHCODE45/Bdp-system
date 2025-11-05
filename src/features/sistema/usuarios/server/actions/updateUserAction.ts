"use server";
import { revalidatePath } from "next/cache";
import { editUserSchema } from "../validators/editUserSchema";
import prisma from "@/core/lib/prisma";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository.repository";
import { BcryptPasswordHasher } from "@/core/shared/security/hasher";

// Tipo para el FormData esperado
type UpdateUserFormData = {
  id: string;
  name: string;
  email: string;
  password?: string;
  roles: string;
  isActive: string;
};

// Helper para extraer valores tipados del FormData
function getFormDataValues(formData: FormData): UpdateUserFormData {
  const id = formData.get("id");
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const roles = formData.get("roles");
  const isActive = formData.get("isActive");

  return {
    id: typeof id === "string" ? id : "",
    name: typeof name === "string" ? name : "",
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : undefined,
    roles: typeof roles === "string" ? roles : "[]",
    isActive: typeof isActive === "string" ? isActive : "false",
  };
}

export const updateUserAction = async (input: FormData) => {
  const formValues = getFormDataValues(input);

  let roles: string[] = [];
  try {
    roles = JSON.parse(formValues.roles);
  } catch {
    return { ok: false, error: "Error al parsear roles enviados" };
  }

  // Validación de entrada
  const parsed = editUserSchema.safeParse({
    id: formValues.id,
    name: formValues.name,
    email: formValues.email,
    password: formValues.password,
    roles,
    isActive: formValues.isActive === "true" || formValues.isActive === "True",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  try {
    const userRepository = new PrismaUserRepository(prisma);
    const passwordHasher = new BcryptPasswordHasher();

    // Hash de la contraseña solo si se proporcionó una nueva
    let passwordHash: string | undefined;
    if (parsed.data.password && parsed.data.password.length > 0) {
      passwordHash = await passwordHasher.hash(parsed.data.password);
    }

    await userRepository.update({
      id: parsed.data.id,
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      roles: parsed.data.roles,
      isActive: parsed.data.isActive,
    });

    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Error al actualizar usuario",
    };
  }
};
