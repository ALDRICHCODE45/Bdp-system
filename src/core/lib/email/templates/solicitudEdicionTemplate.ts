export interface SolicitudEdicionData {
  solicitanteNombre: string;
  solicitanteEmail: string;
  semana: number;
  ano: number;
  justificacion: string;
  appUrl: string;
}

export function generateSolicitudEdicionEmail(
  data: SolicitudEdicionData,
): string {
  const { solicitanteNombre, solicitanteEmail, semana, ano, justificacion, appUrl } = data;
  const solicitudesUrl = `${appUrl}/juridico/horas`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nueva Solicitud de Edición de Horas</title>
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
                Nueva Solicitud de Edición
              </h2>
              <p style="margin:0 0 24px;color:#4a4a6a;font-size:15px;line-height:1.6;">
                Un usuario ha solicitado autorización para editar sus horas registradas.
              </p>

              <!-- Details table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8e8f0;border-radius:6px;overflow:hidden;margin-bottom:24px;">
                <tr style="background-color:#f8f8fc;">
                  <td style="padding:12px 16px;color:#8888a8;font-size:13px;font-weight:600;width:140px;border-bottom:1px solid #e8e8f0;">Solicitante</td>
                  <td style="padding:12px 16px;color:#1a1a2e;font-size:14px;border-bottom:1px solid #e8e8f0;">${solicitanteNombre}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;color:#8888a8;font-size:13px;font-weight:600;border-bottom:1px solid #e8e8f0;">Correo</td>
                  <td style="padding:12px 16px;color:#4a4a6a;font-size:14px;border-bottom:1px solid #e8e8f0;">${solicitanteEmail}</td>
                </tr>
                <tr style="background-color:#f8f8fc;">
                  <td style="padding:12px 16px;color:#8888a8;font-size:13px;font-weight:600;border-bottom:1px solid #e8e8f0;">Semana</td>
                  <td style="padding:12px 16px;color:#1a1a2e;font-size:14px;border-bottom:1px solid #e8e8f0;">Semana ${semana} del ${ano}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;color:#8888a8;font-size:13px;font-weight:600;vertical-align:top;">Justificación</td>
                  <td style="padding:12px 16px;color:#4a4a6a;font-size:14px;line-height:1.6;">${justificacion}</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${solicitudesUrl}"
                       style="display:inline-block;background-color:#1a1a2e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:6px;letter-spacing:0.3px;">
                      Ver Solicitudes Pendientes
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

export function generateSolicitudEdicionPlainText(
  data: SolicitudEdicionData,
): string {
  const { solicitanteNombre, solicitanteEmail, semana, ano, justificacion, appUrl } = data;
  const solicitudesUrl = `${appUrl}/juridico/horas`;

  return `BDP System — Nueva Solicitud de Edición de Horas

Un usuario ha solicitado autorización para editar sus horas registradas.

Solicitante: ${solicitanteNombre}
Correo: ${solicitanteEmail}
Semana: Semana ${semana} del ${ano}
Justificación: ${justificacion}

Ver solicitudes pendientes:
${solicitudesUrl}

---
Este es un correo automático del BDP System.
Por favor no respondas a este mensaje.
`;
}
