import { PrismaClient } from "@prisma/client";
import type {
  AutorizacionEdicionRepository,
  AutorizacionEdicionEntity,
  CreateAutorizacionArgs,
} from "./AutorizacionEdicionRepository.repository";

const autorizacionEdicionIncludes = {
  solicitante: { select: { id: true, name: true, email: true } },
  autorizador: { select: { id: true, name: true, email: true } },
  registroHora: { select: { id: true, ano: true, semana: true } },
} as const;

export class PrismaAutorizacionEdicionRepository
  implements AutorizacionEdicionRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateAutorizacionArgs): Promise<AutorizacionEdicionEntity> {
    return await this.prisma.autorizacionEdicion.create({
      data: {
        registroHoraId: data.registroHoraId,
        solicitanteId: data.solicitanteId,
        justificacion: data.justificacion,
        estado: "PENDIENTE",
      },
      include: autorizacionEdicionIncludes,
    });
  }

  async findById(id: string): Promise<AutorizacionEdicionEntity | null> {
    return await this.prisma.autorizacionEdicion.findUnique({
      where: { id },
      include: autorizacionEdicionIncludes,
    });
  }

  async findPendientesByRegistro(
    registroHoraId: string
  ): Promise<AutorizacionEdicionEntity[]> {
    return await this.prisma.autorizacionEdicion.findMany({
      where: { registroHoraId, estado: "PENDIENTE" },
      include: autorizacionEdicionIncludes,
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllPendientes(): Promise<AutorizacionEdicionEntity[]> {
    return await this.prisma.autorizacionEdicion.findMany({
      where: { estado: "PENDIENTE" },
      include: autorizacionEdicionIncludes,
      orderBy: { createdAt: "asc" },
    });
  }

  async updateEstado(
    id: string,
    estado: "AUTORIZADA" | "RECHAZADA" | "UTILIZADA",
    autorizadorId?: string,
    motivoRechazo?: string
  ): Promise<AutorizacionEdicionEntity> {
    return await this.prisma.autorizacionEdicion.update({
      where: { id },
      data: {
        estado,
        ...(autorizadorId ? { autorizadorId } : {}),
        ...(motivoRechazo ? { motivoRechazo } : {}),
      },
      include: autorizacionEdicionIncludes,
    });
  }
}
