import { EntradasSalidas } from "@prisma/client";
import { EntradasSalidasDTO } from "../dtos/EntradasSalidasDto.dto";

/**
 * Convierte una Entrada y salida de Prisma  a EntradaSalidaDTO
 * @param EntradaSalida- EntradaSalida de Prisma
 * @returns EntradaSalidaDTO
 */
export const toEntradaSalidaDTO = (
  EntradaSalidaPrisma: EntradasSalidas
): EntradasSalidasDTO => {
  return {
    id: EntradaSalidaPrisma.id,
    correspondencia: EntradaSalidaPrisma.correspondencia || undefined,
    destinatario: EntradaSalidaPrisma.destinatario,
    visitante: EntradaSalidaPrisma.visitante,
    motivo: EntradaSalidaPrisma.motivo,
    telefono: EntradaSalidaPrisma.telefono || undefined,
    fecha: EntradaSalidaPrisma.fecha,
    hora_entrada: EntradaSalidaPrisma.hora_entrada,
    hora_salida: EntradaSalidaPrisma.hora_salida,
    updatedAt: EntradaSalidaPrisma.updatedAt,
    createdAt: EntradaSalidaPrisma.createdAt,
  };
};

/**
 * Convierte un array de EntradasSalidas de Prisma a EntradasSalidasDTO[]
 * @param EntradasSalidas- Array de EntradasSalidas de Prisma
 * @returns Array de EntradasSalidasDTO
 */
export function toEntradasSalidasDTOArray(
  entradasSalidas: EntradasSalidas[]
): EntradasSalidasDTO[] {
  return entradasSalidas.map(toEntradaSalidaDTO);
}
