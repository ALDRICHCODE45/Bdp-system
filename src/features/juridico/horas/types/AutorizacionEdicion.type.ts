import type { AutorizacionEstado } from "@prisma/client";

export type AutorizacionEdicionType = {
  id: string;
  registroHoraId: string;
  solicitanteId: string;
  autorizadorId: string | null;
  justificacion: string;
  estado: AutorizacionEstado;
  motivoRechazo: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SolicitarEdicionInput = {
  registroHoraId: string;
  justificacion: string;
};

export type AutorizarEdicionInput = {
  autorizacionId: string;
};

export type RechazarEdicionInput = {
  autorizacionId: string;
  motivoRechazo: string;
};
