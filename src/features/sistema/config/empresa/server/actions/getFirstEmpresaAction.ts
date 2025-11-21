"use server";
import { makeEmpresaService } from "../services/makeEmpresaService";
import { toEmpresaDto } from "../mappers/empresaMapper";
import prisma from "@/core/lib/prisma";

export const getFirstEmpresaAction = async () => {
  try {
    const empresaService = makeEmpresaService({ prisma });
    const result = await empresaService.getFirst();

    if (!result.ok) {
      return { ok: false, error: result.error.message, data: null };
    }

    // Si no hay empresa, retornar null
    if (!result.value) {
      return { ok: true, data: null, error: null };
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

