export interface RecordatorioHorasData {
  userName: string;
  semana: number;
  ano: number;
  appUrl: string;
}

export function generateRecordatorioHorasEmail(
  data: RecordatorioHorasData,
): string {
  const { userName, semana, ano, appUrl } = data;
  const registrarUrl = `${appUrl}/juridico/horas`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recordatorio de Registro de Horas</title>
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
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:600;">
                Recordatorio: Registro de Horas
              </h2>
              <p style="margin:0 0 16px;color:#4a4a6a;font-size:15px;line-height:1.6;">
                Hola <strong>${userName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#4a4a6a;font-size:15px;line-height:1.6;">
                No has registrado tus horas de la semana <strong>${semana}</strong> del <strong>${ano}</strong>.
                Tienes hasta el <strong>domingo a las 11:59 PM</strong> para registrarlas.
              </p>

              <!-- Alert box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px;padding:16px 20px;">
                    <p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
                      ⚠️ &nbsp;Recuerda que el registro de horas fuera de plazo requiere una solicitud de autorización al administrador.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${registrarUrl}"
                       style="display:inline-block;background-color:#1a1a2e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:6px;letter-spacing:0.3px;">
                      Registrar Horas
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

export function generateRecordatorioHorasPlainText(
  data: RecordatorioHorasData,
): string {
  const { userName, semana, ano, appUrl } = data;
  const registrarUrl = `${appUrl}/juridico/horas`;

  return `BDP System — Recordatorio de Registro de Horas

Hola ${userName},

No has registrado tus horas de la semana ${semana} del ${ano}.
Tienes hasta el domingo a las 11:59 PM para registrarlas.

ATENCIÓN: El registro de horas fuera de plazo requiere una solicitud de autorización al administrador.

Registrar tus horas aquí:
${registrarUrl}

---
Este es un correo automático del BDP System.
Por favor no respondas a este mensaje.
`;
}
