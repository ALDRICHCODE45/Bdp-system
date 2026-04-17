import { inngest, juridicoEditRequestCreated } from "../inngest";
import prisma from "@/core/lib/prisma";
import { sendEmail } from "@/core/lib/email/email";
import {
  generateSolicitudEdicionEmail,
  generateSolicitudEdicionPlainText,
} from "@/core/lib/email/templates/solicitudEdicionTemplate";

export const handleEditRequestCreated = inngest.createFunction(
  {
    id: "juridico-edit-request-created",
    name: "Jurídico: Notificar admin de solicitud de edición",
    triggers: [{ event: juridicoEditRequestCreated }],
  },
  async ({ event, step }) => {
    const { solicitanteNombre, solicitanteEmail, semana, ano, justificacion } =
      event.data;

    // Find admins with authorization permission
    const admins = await step.run("find-admins", async () => {
      return prisma.user.findMany({
        where: {
          isActive: true,
          roles: {
            some: {
              role: {
                permissions: {
                  some: {
                    permission: {
                      name: "juridico-horas:autorizar-edicion",
                    },
                  },
                },
              },
            },
          },
        },
        select: { email: true },
      });
    });

    if (admins.length === 0) {
      return { sent: 0 };
    }

    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const adminEmails = admins.map((a) => a.email);

    await step.run("send-notification", async () => {
      await sendEmail({
        to: adminEmails,
        subject: `📝 Solicitud de edición de horas — ${solicitanteNombre}`,
        html: generateSolicitudEdicionEmail({
          solicitanteNombre,
          solicitanteEmail,
          semana,
          ano,
          justificacion,
          appUrl,
        }),
        text: generateSolicitudEdicionPlainText({
          solicitanteNombre,
          solicitanteEmail,
          semana,
          ano,
          justificacion,
          appUrl,
        }),
      });
    });

    return { sent: adminEmails.length };
  },
);
