export interface ReporteAdminData {
  usuarios: Array<{ name: string; email: string }>;
  semana: number;
  ano: number;
  appUrl: string;
}

export function generateReporteAdminEmail(data: ReporteAdminData): string {
  const { usuarios, semana, ano, appUrl } = data;
  const reporteUrl = `${appUrl}/juridico/horas/reportes`;

  const usuariosRows =
    usuarios.length > 0
      ? usuarios
          .map(
            (u) => `
          <tr>
            <td style="padding:10px 16px;border-bottom:1px solid #e8e8f0;color:#1a1a2e;font-size:14px;">${u.name}</td>
            <td style="padding:10px 16px;border-bottom:1px solid #e8e8f0;color:#4a4a6a;font-size:14px;">${u.email}</td>
          </tr>`,
          )
          .join("")
      : `
          <tr>
            <td colspan="2" style="padding:20px 16px;text-align:center;color:#8888a8;font-size:14px;">
              Todos los usuarios han registrado sus horas. ✅
            </td>
          </tr>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reporte Semanal de Horas — Semana ${semana}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">BDP System</h1>
              <p style="margin:8px 0 0;color:#a0a0b8;font-size:13px;">Reporte Administrativo</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;font-weight:600;">
                Reporte de Horas — Semana ${semana} / ${ano}
              </h2>
              <p style="margin:0 0 24px;color:#4a4a6a;font-size:14px;line-height:1.6;">
                El siguiente listado muestra los usuarios que <strong>no registraron</strong> sus horas durante la semana ${semana} del ${ano}.
              </p>

              <!-- Summary badge -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#fef2f2;border-left:4px solid #ef4444;border-radius:4px;padding:14px 20px;">
                    <p style="margin:0;color:#991b1b;font-size:14px;font-weight:600;">
                      ${usuarios.length} usuario${usuarios.length !== 1 ? "s" : ""} sin registrar horas
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Users table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8e8f0;border-radius:6px;overflow:hidden;margin-bottom:32px;">
                <tr style="background-color:#f8f8fc;">
                  <th style="padding:12px 16px;text-align:left;color:#1a1a2e;font-size:13px;font-weight:600;border-bottom:1px solid #e8e8f0;">Nombre</th>
                  <th style="padding:12px 16px;text-align:left;color:#1a1a2e;font-size:13px;font-weight:600;border-bottom:1px solid #e8e8f0;">Correo</th>
                </tr>
                ${usuariosRows}
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${reporteUrl}"
                       style="display:inline-block;background-color:#1a1a2e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:6px;letter-spacing:0.3px;">
                      Ver Reporte Completo
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

export function generateReporteAdminPlainText(data: ReporteAdminData): string {
  const { usuarios, semana, ano, appUrl } = data;
  const reporteUrl = `${appUrl}/juridico/horas/reportes`;

  const usuariosList =
    usuarios.length > 0
      ? usuarios.map((u) => `  - ${u.name} <${u.email}>`).join("\n")
      : "  (Todos los usuarios han registrado sus horas)";

  return `BDP System — Reporte Semanal de Horas

Reporte de Horas — Semana ${semana} / ${ano}

Usuarios sin registrar horas (${usuarios.length}):
${usuariosList}

Ver reporte completo:
${reporteUrl}

---
Este es un correo automático del BDP System.
Por favor no respondas a este mensaje.
`;
}
