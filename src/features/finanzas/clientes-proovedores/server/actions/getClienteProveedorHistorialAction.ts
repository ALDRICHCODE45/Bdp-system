"use server";
import { makeClienteProveedorHistorialService } from "../services/makeClienteProveedorHistorialService";
import { toClienteProveedorHistorialDtoArray } from "../mappers/clienteProveedorHistorialMapper";
import prisma from "@/core/lib/prisma";
import { z } from "zod";

const getHistorialSchema = z.object({
  clienteProveedorId: z.string().uuid("ID de cliente/proveedor inválido"),
});

export const getClienteProveedorHistorialAction = async (
  clienteProveedorId: string
) => {
  try {
    // Validar entrada
    const parsed = getHistorialSchema.parse({ clienteProveedorId });

    // Verificar que el cliente/proveedor existe
    const clienteProveedor = await prisma.clienteProveedor.findUnique({
      where: { id: parsed.clienteProveedorId },
    });

    if (!clienteProveedor) {
      return {
        ok: false,
        error: "Cliente/proveedor no encontrado",
      };
    }

    // Obtener historial
    const historialService = makeClienteProveedorHistorialService({ prisma });
    const result = await historialService.getHistorialByClienteProveedorId(
      parsed.clienteProveedorId
    );

    if (!result.ok) {
      return {
        ok: false,
        error: result.error.message,
      };
    }

    // Convertir a DTOs
    const historialDtos = toClienteProveedorHistorialDtoArray(result.value);

    return {
      ok: true,
      data: historialDtos,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message || "Error de validación",
      };
    }

    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Error al obtener historial",
    };
  }
};

