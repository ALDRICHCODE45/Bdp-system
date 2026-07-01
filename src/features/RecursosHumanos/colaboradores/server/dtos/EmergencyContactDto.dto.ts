/**
 * DTO (server→client boundary) for an EmergencyContact entry.
 *
 * Dates are serialized as ISO strings on the way to the client to keep the
 * payload `JSON.stringify`-safe and decoupled from the Prisma `Date` runtime
 * (CC7). The mapper is the single source of truth for this conversion.
 */
export type EmergencyContactDto = {
  id: string;
  colaboradorId: string;
  nombre: string;
  parentesco: string;
  telefono: string;
  email: string | null;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
};
