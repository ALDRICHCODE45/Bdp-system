import { getISOWeek, getISOWeekYear, subWeeks } from "date-fns";

import { inngest } from "../inngest";
import prisma from "@/core/lib/prisma";
import { getCurrentCDMXDate } from "@/core/shared/helpers/weekUtils";
import { sendEmail } from "@/core/lib/email/email";
import {
  generateReporteAdminEmail,
  generateReporteAdminPlainText,
} from "@/core/lib/email/templates/reporteAdminTemplate";

export const mondayReportCron = inngest.createFunction(
  {
    id: "juridico-monday-admin-report",
    name: "Jurídico: Reporte semanal de horas (lunes)",
    triggers: [{ cron: "0 15 * * 1" }], // 15:00 UTC Monday = ~9:00 AM CDMX (UTC-6)
  },
  async ({ step }) => {
    // Calculate previous week's semana/ano
    const { prevSemana, prevAno } = await step.run(
      "get-previous-week",
      async () => {
        const now = getCurrentCDMXDate();
        const prevWeekDate = subWeeks(now, 1);
        return {
          prevSemana: getISOWeek(prevWeekDate),
          prevAno: getISOWeekYear(prevWeekDate),
        };
      },
    );

    // Find users with permission who didn't log ANY hours in the previous week
    const usersWithoutHours = await step.run(
      "find-users-without-hours-prev-week",
      async () => {
        // 1. Get all active users with juridico-horas permission
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

        // 2. Get users who logged hours in the previous week
        const usersWithHours = await prisma.registroHora.findMany({
          where: { ano: prevAno, semana: prevSemana },
          select: { usuarioId: true },
          distinct: ["usuarioId"],
        });
        const usersWithHoursSet = new Set(
          usersWithHours.map((u) => u.usuarioId),
        );

        // 3. Return those who did NOT log hours
        return usersWithPermission.filter((u) => !usersWithHoursSet.has(u.id));
      },
    );

    // Find admin users who can authorize edits
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
                      name: {
                        in: ["juridico-horas:autorizar-edicion", "admin:all"],
                      },
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
      return { sent: 0, message: "No hay administradores configurados" };
    }

    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const adminEmails = admins.map((a) => a.email);

    // Send a single consolidated email to all admins
    await step.run("send-admin-report", async () => {
      await sendEmail({
        to: adminEmails,
        subject: `📊 Reporte semanal de horas — Semana ${prevSemana} / ${prevAno}`,
        html: generateReporteAdminEmail({
          usuarios: usersWithoutHours.map((u) => ({
            name: u.name,
            email: u.email,
          })),
          semana: prevSemana,
          ano: prevAno,
          appUrl,
        }),
        text: generateReporteAdminPlainText({
          usuarios: usersWithoutHours.map((u) => ({
            name: u.name,
            email: u.email,
          })),
          semana: prevSemana,
          ano: prevAno,
          appUrl,
        }),
      });
    });

    return {
      sent: adminEmails.length,
      usersWithoutHours: usersWithoutHours.length,
      semana: prevSemana,
      ano: prevAno,
    };
  },
);
