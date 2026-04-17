import { Inngest, eventType, staticSchema } from "inngest";

// Typed event definitions for the BDP System

export const juridicoReminderWeekly = eventType("juridico/reminder-weekly");

export const juridicoAdminReport = eventType("juridico/admin-report");

export const juridicoEditRequestCreated = eventType(
  "juridico/edit-request.created",
  {
    schema: staticSchema<{
      autorizacionId: string;
      solicitanteNombre: string;
      solicitanteEmail: string;
      registroHoraId: string;
      justificacion: string;
      semana: number;
      ano: number;
    }>(),
  },
);

export const juridicoEditRequestAuthorized = eventType(
  "juridico/edit-request.authorized",
  {
    schema: staticSchema<{
      autorizacionId: string;
      registroHoraId: string;
      solicitanteEmail: string;
      solicitanteNombre: string;
      semana: number;
      ano: number;
    }>(),
  },
);

export const inngest = new Inngest({
  id: "bdp-system",
});
