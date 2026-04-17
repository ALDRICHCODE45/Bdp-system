import { inngest } from "../inngest";
import prisma from "@/core/lib/prisma";
import { getCurrentWeekInfo } from "@/core/shared/helpers/weekUtils";
import { sendEmail } from "@/core/lib/email/email";
import {
  generateRecordatorioHorasEmail,
  generateRecordatorioHorasPlainText,
} from "@/core/lib/email/templates/recordatorioHorasTemplate";

export const fridayReminderCron = inngest.createFunction(
  {
    id: "juridico-friday-reminder",
    name: "Jurídico: Recordatorio semanal de horas (viernes)",
    triggers: [{ cron: "0 15 * * 5" }], // 15:00 UTC = ~9:00 AM CDMX (UTC-6)
  },
  async ({ step }) => {
    const { ano, semana } = await step.run("get-current-week", async () => {
      return getCurrentWeekInfo();
    });

    // Find users with juridico-horas permission who haven't logged hours this week
    const usersWithoutHours = await step.run(
      "find-users-without-hours",
      async () => {
        // 1. Get all active users who have the permission (via roles)
        const usersWithPermission = await prisma.user.findMany({
          where: {
            isActive: true,
            roles: {
              some: {
                role: {
                  permissions: {
                    some: {
                      permission: {
                        name: {
                          in: [
                            "juridico-horas:registrar",
                            "juridico-horas:gestionar",
                            "admin:all",
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          select: { id: true, name: true, email: true },
        });

        // 2. Get users who already logged hours this week
        const usersWithHours = await prisma.registroHora.findMany({
          where: { ano, semana },
          select: { usuarioId: true },
          distinct: ["usuarioId"],
        });
        const usersWithHoursSet = new Set(
          usersWithHours.map((u) => u.usuarioId),
        );

        // 3. Return only those who haven't logged hours
        return usersWithPermission.filter((u) => !usersWithHoursSet.has(u.id));
      },
    );

    if (usersWithoutHours.length === 0) {
      return { sent: 0, message: "Todos los usuarios registraron sus horas" };
    }

    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    let sent = 0;

    for (const user of usersWithoutHours) {
      await step.run(`send-reminder-${user.id}`, async () => {
        await sendEmail({
          to: user.email,
          subject: `⏰ Recordatorio: Registra tus horas de la semana ${semana}`,
          html: generateRecordatorioHorasEmail({
            userName: user.name,
            semana,
            ano,
            appUrl,
          }),
          text: generateRecordatorioHorasPlainText({
            userName: user.name,
            semana,
            ano,
            appUrl,
          }),
        });
      });
      sent++;
    }

    return { sent, semana, ano };
  },
);
