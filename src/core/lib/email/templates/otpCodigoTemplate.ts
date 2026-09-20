export interface OtpCodigoData {
  nombre: string;
  codigo: string;
  expiraEnMinutos: number;
}

export function generateOtpCodigoEmail(data: OtpCodigoData): string {
  const { nombre, codigo, expiraEnMinutos } = data;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu código de acceso</title>
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
              <p style="margin:8px 0 0;color:#a0a0b8;font-size:13px;">Verificación de inicio de sesión</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:600;">
                Hola, ${nombre}
              </h2>
              <p style="margin:0 0 24px;color:#4a4a6a;font-size:15px;line-height:1.6;">
                Recibimos una solicitud de inicio de sesión. Ingresa el siguiente código para completar el acceso:
              </p>

              <!-- Code -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center" style="background-color:#f8f8fc;border:1px solid #e8e8f0;border-radius:8px;padding:28px 16px;">
                    <span style="display:block;color:#8888a8;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Código de verificación</span>
                    <span style="display:block;color:#1a1a2e;font-size:36px;font-weight:700;letter-spacing:12px;">${codigo}</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#4a4a6a;font-size:15px;line-height:1.6;">
                Este código es de un solo uso y expira en ${expiraEnMinutos} minutos.
              </p>
              <p style="margin:0;color:#8888a8;font-size:13px;line-height:1.6;">
                Si no solicitaste este código, ignora este mensaje. No compartas el código con nadie.
              </p>
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

export function generateOtpCodigoPlainText(data: OtpCodigoData): string {
  const { nombre, codigo, expiraEnMinutos } = data;

  return `BDP System — Verificación de inicio de sesión

Hola, ${nombre}:

Recibimos una solicitud de inicio de sesión. Ingresa el siguiente código para completar el acceso:

Código de verificación: ${codigo}

Este código es de un solo uso y expira en ${expiraEnMinutos} minutos.

Si no solicitaste este código, ignora este mensaje. No compartas el código con nadie.

---
Este es un correo automático del BDP System.
Por favor no respondas a este mensaje.
`;
}
