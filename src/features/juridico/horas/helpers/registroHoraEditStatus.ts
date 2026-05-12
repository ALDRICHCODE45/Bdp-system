import { isWithinDeadline } from "@/core/shared/helpers/weekUtils";
import type { RegistroHoraDto } from "../server/dtos/RegistroHoraDto.dto";

export type RegistroHoraEditStatus =
  | "EN_PLAZO"
  | "AUTORIZADO"
  | "GESTION"
  | "BLOQUEADO";

type RegistroHoraEditStatusInput = Pick<
  RegistroHoraDto,
  "ano" | "semana" | "hasActiveAuthorization"
>;

export function getRegistroHoraEditStatus(
  registro: RegistroHoraEditStatusInput,
  options?: { canManage?: boolean }
): RegistroHoraEditStatus {
  const withinDeadline = isWithinDeadline(registro.ano, registro.semana);
  const canManage = options?.canManage === true;

  if (withinDeadline) {
    return "EN_PLAZO";
  }

  if (canManage) {
    return "GESTION";
  }

  return registro.hasActiveAuthorization ? "AUTORIZADO" : "BLOQUEADO";
}

export function canEditRegistroHora(
  registro: RegistroHoraEditStatusInput,
  options?: { canManage?: boolean }
): boolean {
  const status = getRegistroHoraEditStatus(registro, options);
  return (
    status === "EN_PLAZO" ||
    status === "AUTORIZADO" ||
    status === "GESTION"
  );
}
