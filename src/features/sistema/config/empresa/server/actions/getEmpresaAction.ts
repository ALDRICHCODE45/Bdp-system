"use server";
import { makeEmpresaService } from "../services/makeEmpresaService";
import { toEmpresaDto } from "../mappers/empresaMapper";
import prisma from "@/core/lib/prisma";

export const getEmpresaAction = async (id: string) => {
  try {
    const empresaService = makeEmpresaService({ prisma });
    const result = await empresaService.getById(id);

    if (!result.ok) {
      return { ok: false, error: result.error.message, data: null };
    }

    const empresaDto = toEmpresaDto(result.value);
    return { ok: true, data: empresaDto, error: null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al obtener empresa",
      data: null,
    };
  }
};

