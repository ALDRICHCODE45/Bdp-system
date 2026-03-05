"use server";

import { DigitalOceanSpacesService } from "../services/DigitalOceanSpacesService";

/**
 * Sube un archivo directamente a Digital Ocean Spaces y devuelve la URL pública.
 * Usado cuando necesitamos la URL antes de que exista la entidad asociada
 * (ej: subir el PDF timbrado de una factura durante su creación).
 */
export const uploadToSpacesAction = async (
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> => {
  try {
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "facturas";

    if (!file || file.size === 0) {
      return { ok: false, error: "No se proporcionó ningún archivo" };
    }

    const spacesService = new DigitalOceanSpacesService();
    const url = await spacesService.uploadFile(file, folder);

    return { ok: true, url };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al subir el archivo",
    };
  }
};
