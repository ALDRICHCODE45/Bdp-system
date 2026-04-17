export type AutorizacionEdicionDto = {
  id: string;
  registroHoraId: string;
  ano: number;
  semana: number;
  solicitanteId: string;
  solicitanteNombre: string;
  solicitanteEmail: string;
  autorizadorId: string | null;
  autorizadorNombre: string | null;
  justificacion: string;
  estado: string;
  motivoRechazo: string | null;
  createdAt: string;
  updatedAt: string;
};
