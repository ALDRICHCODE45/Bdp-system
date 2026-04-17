import { inngest, juridicoEditRequestAuthorized } from "../inngest";
import { sendEmail } from "@/core/lib/email/email";
import {
  generateAutorizacionEdicionEmail,
  generateAutorizacionEdicionPlainText,
} from "@/core/lib/email/templates/autorizacionEdicionTemplate";

export const handleEditRequestAuthorized = inngest.createFunction(
  {
    id: "juridico-edit-request-authorized",
    name: "Jurídico: Notificar solicitante de edición autorizada",
    triggers: [{ event: juridicoEditRequestAuthorized }],
  },
  async ({ event, step }) => {
    const { solicitanteNombre, solicitanteEmail, semana, ano } = event.data;

    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    await step.run("send-authorization-email", async () => {
      await sendEmail({
        to: solicitanteEmail,
        subject: `✅ Tu solicitud de edición fue autorizada — Semana ${semana}`,
        html: generateAutorizacionEdicionEmail({
          userName: solicitanteNombre,
          semana,
          ano,
          appUrl,
        }),
        text: generateAutorizacionEdicionPlainText({
          userName: solicitanteNombre,
          semana,
          ano,
          appUrl,
        }),
      });
    });

    return { sent: 1, solicitanteEmail, semana, ano };
  },
);
