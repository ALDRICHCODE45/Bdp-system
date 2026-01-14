"use server";
import { revalidatePath } from "next/cache";
import { CreateAsistenciaDto } from "../Dtos/CreateAsistenciaDto.Dto";
import { makeAsistenciaService } from "../services/makeAsistenciaService";
import prisma from "@/core/lib/prisma";

/**
 * Server action pública para registro de asistencia via QR
 * NO requiere autenticación - diseñada para rutas públicas
 */
export const createAsistenciaPublicAction = async (input: CreateAsistenciaDto) => {
  try {
    const asistenciaService = makeAsistenciaService({ prisma });
    const result = await asistenciaService.create(input);

    if (!result.ok) {
      return { ok: false, message: result.error.message };
    }

    revalidatePath("/asistencias");
    return { ok: true };
  } catch (error) {
    console.error("Error creating public asistencia:", error);
    return { ok: false, message: "Error interno al registrar asistencia" };
  }
};
