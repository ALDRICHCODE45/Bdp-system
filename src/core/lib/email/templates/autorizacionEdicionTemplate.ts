export interface AutorizacionEdicionData {
  userName: string;
  semana: number;
  ano: number;
  appUrl: string;
}

export function generateAutorizacionEdicionEmail(
  data: AutorizacionEdicionData,
): string {
  const { userName, semana, ano, appUrl } = data;
  const editarUrl = `${appUrl}/juridico/horas`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Solicitud de Edición Autorizada</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">BDP System</h1>
              <p style="margin:8px 0 0;color:#a0a0b8;font-size:13px;">Sistema de Gestión Jurídica</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <!-- Success icon area -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <div style="width:56px;height:56px;background-color:#dcfce7;border-radius:50%;text-align:center;line-height:56px;font-size:28px;display:inline-block;">
                      ✅
                    </div>
                  </td>
                </tr>
              </table>

              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:600;text-align:center;">
                Solicitud Autorizada
              </h2>
              <p style="margin:0 0 16px;color:#4a4a6a;font-size:15px;line-height:1.6;">
                Hola <strong>${userName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#4a4a6a;font-size:15px;line-height:1.6;">
                Tu solicitud de edición para la semana <strong>${semana}</strong> del <strong>${ano}</strong> ha sido <strong>autorizada</strong>.
                Puedes editar tus horas <strong>una sola vez</strong>.
              </p>

              <!-- Warning box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px;padding:16px 20px;">
                    <p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
                      ⚠️ &nbsp;Esta autorización es de uso único. Una vez que edites tus horas, no podrás volver a hacerlo sin una nueva solicitud.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${editarUrl}"
                       style="display:inline-block;background-color:#16a34a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:6px;letter-spacing:0.3px;">
                      Editar Horas
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f8fc;padding:24px 40px;border-top:1px solid #e8e8f0;text-align:center;">
              <p style="margin:0;color:#8888a8;font-size:12px;line-height:1.6;">
                Este es un correo automático del BDP System.<br />
                Por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateAutorizacionEdicionPlainText(
  data: AutorizacionEdicionData,
): string {
  const { userName, semana, ano, appUrl } = data;
  const editarUrl = `${appUrl}/juridico/horas`;

  return `BDP System — Solicitud de Edición Autorizada

Hola ${userName},

Tu solicitud de edición para la semana ${semana} del ${ano} ha sido AUTORIZADA.
Puedes editar tus horas una sola vez.

IMPORTANTE: Esta autorización es de uso único. Una vez que edites tus horas,
no podrás volver a hacerlo sin una nueva solicitud.

Editar tus horas aquí:
${editarUrl}

---
Este es un correo automático del BDP System.
Por favor no respondas a este mensaje.
`;
}
