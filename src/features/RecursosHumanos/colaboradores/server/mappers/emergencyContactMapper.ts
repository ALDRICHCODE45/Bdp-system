import type { EmergencyContact } from "@prisma/client";
import type { EmergencyContactDto } from "../dtos/EmergencyContactDto.dto";

/**
 * Map a single Prisma `EmergencyContact` row into the typed DTO that travels
 * to the client. The DTO is a structural superset of the Prisma fields minus
 * the runtime-coupled `Date` types — these are serialized to ISO strings so
 * the mapper is the ONLY place where that conversion happens (CC7).
 */
export function toEmergencyContactDto(
  contact: EmergencyContact
): EmergencyContactDto {
  return {
    id: contact.id,
    colaboradorId: contact.colaboradorId,
    nombre: contact.nombre,
    parentesco: contact.parentesco,
    telefono: contact.telefono,
    email: contact.email ?? null,
    notas: contact.notas ?? null,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

/**
 * Map an array of Prisma rows to DTOs. Re-exported alongside the single-item
 * helper for parity with `roleMapper` / `permissionMapper` in the codebase.
 */
export function toEmergencyContactDtoArray(
  contacts: EmergencyContact[]
): EmergencyContactDto[] {
  return contacts.map(toEmergencyContactDto);
}
