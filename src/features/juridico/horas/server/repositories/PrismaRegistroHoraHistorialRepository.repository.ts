import { PrismaClient } from "@prisma/client";
import type { RegistroHoraHistorial } from "@prisma/client";
import type {
  RegistroHoraHistorialRepository,
  CreateRegistroHoraHistorialArgs,
} from "./RegistroHoraHistorialRepository.repository";

export class PrismaRegistroHoraHistorialRepository
  implements RegistroHoraHistorialRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(
    data: CreateRegistroHoraHistorialArgs
  ): Promise<RegistroHoraHistorial> {
    return await this.prisma.registroHoraHistorial.create({
      data: {
        registroHoraId: data.registroHoraId,
        campo: data.campo,
        valorAnterior: data.valorAnterior ?? null,
        valorNuevo: data.valorNuevo,
        usuarioId: data.usuarioId ?? null,
        motivo: data.motivo ?? null,
      },
    });
  }

  async createMany(data: CreateRegistroHoraHistorialArgs[]): Promise<void> {
    if (data.length === 0) return;
    await this.prisma.registroHoraHistorial.createMany({
      data: data.map((item) => ({
        registroHoraId: item.registroHoraId,
        campo: item.campo,
        valorAnterior: item.valorAnterior ?? null,
        valorNuevo: item.valorNuevo,
        usuarioId: item.usuarioId ?? null,
        motivo: item.motivo ?? null,
      })),
    });
  }

  async findByRegistroHoraId(
    registroHoraId: string
  ): Promise<RegistroHoraHistorial[]> {
    return await this.prisma.registroHoraHistorial.findMany({
      where: { registroHoraId },
      orderBy: { fechaCambio: "desc" },
    });
  }
}
