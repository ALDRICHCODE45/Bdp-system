import type { AutorizacionEdicion, User, RegistroHora } from "@prisma/client";

export type AutorizacionEdicionEntity = AutorizacionEdicion & {
  solicitante: Pick<User, "id" | "name" | "email">;
  autorizador?: Pick<User, "id" | "name" | "email"> | null;
  registroHora: Pick<RegistroHora, "id" | "ano" | "semana">;
};

export type CreateAutorizacionArgs = {
  registroHoraId: string;
  solicitanteId: string;
  justificacion: string;
};

export interface AutorizacionEdicionRepository {
  create(data: CreateAutorizacionArgs): Promise<AutorizacionEdicionEntity>;
  findById(id: string): Promise<AutorizacionEdicionEntity | null>;
  findPendientesByRegistro(
    registroHoraId: string
  ): Promise<AutorizacionEdicionEntity[]>;
  findAllPendientes(): Promise<AutorizacionEdicionEntity[]>;
  updateEstado(
    id: string,
    estado: "AUTORIZADA" | "RECHAZADA" | "UTILIZADA",
    autorizadorId?: string,
    motivoRechazo?: string
  ): Promise<AutorizacionEdicionEntity>;
}
