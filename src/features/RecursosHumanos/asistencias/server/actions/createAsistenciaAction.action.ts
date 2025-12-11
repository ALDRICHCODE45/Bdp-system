"use server";
// import { createAsistenciaSchema } from "../../schemas/createAsistenciaSchema.schema";
import { CreateAsistenciaDto } from "../Dtos/CreateAsistenciaDto.Dto";
import { makeAsistenciaService } from "../services/makeAsistenciaService";
import prisma from "@/core/lib/prisma";

export const createAsistenciaAction = async (input: CreateAsistenciaDto) => {
  const asistenciaService = makeAsistenciaService({ prisma });

  const result = await asistenciaService.create(input);

  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }
};
