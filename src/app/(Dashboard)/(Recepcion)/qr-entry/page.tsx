import QREntradasPage from "@/features/RecursosHumanos/asistencias/pages/QREntradasPage";
import { env } from "@/core/shared/config/env.config";

const QrEntryPage = () => {
  // Build the QR target URLs from the app base URL (NEXTAUTH_URL) so the
  // codes resolve to the current environment instead of a hardcoded host.
  const baseUrl = env.NEXTAUTH_URL.replace(/\/+$/, "");
  const entradaUrl = `${baseUrl}/registro-automatico?tipo=Entrada`;
  const salidaUrl = `${baseUrl}/registro-automatico?tipo=Salida`;

  return <QREntradasPage entradaUrl={entradaUrl} salidaUrl={salidaUrl} />;
};
export default QrEntryPage;
